import { supabase } from '../lib/supabase';

export type DashboardData = {
  clients: any[];
  projects: any[];
  tasks: any[];
  fixes: any[];
  requirements: any[];
  testCases: any[];
  testAttempts: any[];
  activity: any[];
  timeEntries: any[];
  timeTrackingAvailable: boolean;
};

export async function getDashboardAnalytics(): Promise<DashboardData> {
  const [clients, projects, tasks, fixes, requirements, testCases, testAttempts, activity, timeEntries] = await Promise.all([
    supabase.from('clients').select('id, name, company, status, created_at'),
    supabase.from('projects').select('id, name, client_id, status, due_date, created_at'),
    supabase.from('tasks').select('id, title, project_id, status, priority, due_date, created_at'),
    supabase.from('fixes').select('id, project_id, status, created_at'),
    supabase.from('requirements').select('id, project_id, status, priority, category, created_at'),
    supabase.from('test_cases').select('id'),
    supabase.from('test_attempts').select('id, test_case_id'),
    supabase.from('activity_logs').select('action, entity_type, created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('task_time_entries').select('id, task_id, started_at, ended_at, duration_seconds').order('started_at', { ascending: true }),
  ]);

  const firstError = [clients, projects, tasks, fixes, requirements, testCases, testAttempts, activity].find((result) => result.error)?.error;
  if (firstError) throw firstError;

  return {
    clients: clients.data || [],
    projects: projects.data || [],
    tasks: tasks.data || [],
    fixes: fixes.data || [],
    requirements: requirements.data || [],
    testCases: testCases.data || [],
    testAttempts: testAttempts.data || [],
    activity: activity.data || [],
    timeEntries: timeEntries.data || [],
    timeTrackingAvailable: !timeEntries.error,
  };
}

export async function getDashboardKPIs() {
  const data = await getDashboardAnalytics();
  return {
    clients: data.clients.length,
    activeProjects: data.projects.filter((project) => ['IN_PROGRESS', 'ACTIVE', 'OPEN'].includes(String(project.status || '').toUpperCase())).length,
    openTasks: data.tasks.filter((task) => !['COMPLETED', 'DONE'].includes(String(task.status || '').toUpperCase())).length,
    failedTests: data.testCases.filter((test) => String(test.status || '').toUpperCase() === 'FAILED').length,
    openFixes: data.fixes.filter((fix) => !['RESOLVED', 'CLOSED', 'COMPLETED'].includes(String(fix.status || '').toUpperCase())).length,
    recentActivity: data.activity.slice(0, 8),
  };
}
