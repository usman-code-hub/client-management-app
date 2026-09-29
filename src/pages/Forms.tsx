import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { createClient, getClients } from '../services/clients';
import { createProject, getProjects } from '../services/projects';
import { createTask } from '../services/tasks';

type Tab = 'clients' | 'projects' | 'tasks';
type Client = { id: string; name?: string; company?: string; email?: string; platform?: string; status?: string };
type Project = { id: string; name?: string; client_id?: string; platform?: string; status?: string; priority?: string; due_date?: string };
const inputClass = 'w-full rounded-xl border border-[#292e39] bg-[#0b0e14] px-3.5 py-3 text-sm text-[#F5F7FB] outline-none transition focus:border-[#7957ff] focus:ring-4 focus:ring-[#7957ff]/10';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-[#C8D0DC]';

export default function Forms({ fixedTab, onCancel, onCreated }: { fixedTab: Tab; onCancel: () => void; onCreated: () => void | Promise<void> }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const [clientRows, projectRows] = await Promise.all([
        getClients(),
        getProjects(),
      ]);
      setClients(clientRows as Client[]);
      setProjects(projectRows as Project[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function save(event: FormEvent<HTMLFormElement>, type: Tab) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const formEl = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    try {
      const result = type === 'clients'
        ? await createClient({ name: values.name, company: values.company || '', email: values.email, platform: values.platform || '', status: values.status || 'Active', contact_name: values.contact_name || '', phone: values.phone || '', website: values.website || '', lead_source: values.lead_source || '', client_notes: values.client_notes || '', internal_notes: values.internal_notes || '', communication: Array.from(form.getAll('communication')) || [], client_type: values.client_type || '', account_manager: values.account_manager || '' })
        : type === 'projects'
          ? await createProject({ name: values.name, client_id: values.client_id, platform: values.project_type || '', status: values.status || 'NEW', priority: values.priority || 'MEDIUM', due_date: values.due_date || null, description: values.description || '', start_date: values.start_date || null, estimated_hours: values.estimated_hours ? parseInt(String(values.estimated_hours), 10) : null, version: values.version || '', goals: values.goals || '', internal_notes: values.internal_notes || '', project_manager: values.project_manager || '' })
          : await createTask({ title: values.title, client_id: values.client_id || null, project_id: values.project_id, status: values.status, priority: values.priority, due_date: values.due_date || null, description: values.description });
      if (result.error) throw result.error;
      formEl.reset();
      await refresh();
      await onCreated();
      setMessage(`${type[0].toUpperCase()}${type.slice(1, -1)} created successfully.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : (error as { message?: string })?.message;
      setMessage(message ? `Could not save this record: ${message}` : 'Could not save this record. Check your Supabase connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl space-y-7">
      <header>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#A78BFA]">New record</p>
        <h2 className="text-2xl font-bold text-[#F8FAFC]">Create {fixedTab.slice(0, -1)}</h2>
      </header>

      {loading && <p className="text-sm text-[#64748B]">Loading linked records...</p>}
      {fixedTab === 'clients' && <ClientForm onSubmit={(event) => save(event, 'clients')} onCancel={onCancel} saving={saving} />}
      {fixedTab === 'projects' && <ProjectForm clients={clients} onSubmit={(event) => save(event, 'projects')} onCancel={onCancel} saving={saving} />}
      {fixedTab === 'tasks' && <TaskForm clients={clients} projects={projects} onSubmit={(event) => save(event, 'tasks')} onCancel={onCancel} saving={saving} />}

      {message && <p className="rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/10 px-4 py-3 text-sm text-[#DDD6FE]">{message}</p>}
    </div>
  );
}

function FormShell({ children, onSubmit, onCancel, saving, button }: { children: ReactNode; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void; saving: boolean; button: string }) {
  return <form onSubmit={onSubmit} className="rounded-2xl border border-[#242936]/70 bg-linear-to-br from-[#11141B] to-[#0f1118] p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,.7)]"><div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div><div className="mt-6 flex justify-end gap-3 border-t border-[#242833] pt-5"><button type="button" onClick={onCancel} className="rounded-xl border border-[#2b303b] bg-[#191d25] px-5 py-3 text-sm font-semibold text-[#C4C9D3]">Cancel</button><button disabled={saving} className="rounded-xl bg-linear-to-br from-[#6d4aff] to-[#925cff] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 disabled:cursor-wait disabled:opacity-60">{saving ? 'Saving...' : button}</button></div></form>;
}

function Field({ label, name, required = false, type = 'text', placeholder, wide = false }: { label: string; name: string; required?: boolean; type?: string; placeholder?: string; wide?: boolean }) {
  return <label className={wide ? 'md:col-span-2' : ''}><span className={labelClass}>{label}{required && <b className="ml-1 text-[#FF5F7A]">*</b>}</span><input className={inputClass} name={name} type={type} required={required} placeholder={placeholder} /></label>;
}

function Select({ label, name, options, required = false, wide = false }: { label: string; name: string; options: (string | { value: string; label: string })[]; required?: boolean; wide?: boolean }) {
  return <label className={wide ? 'md:col-span-2' : ''}><span className={labelClass}>{label}{required && <b className="ml-1 text-[#FF5F7A]">*</b>}</span><select className={inputClass} name={name} required={required}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => { const item = typeof option === 'string' ? { value: option, label: option } : option; return <option key={item.value} value={item.value}>{item.label}</option>; })}</select></label>;
}

function ClientForm({ onSubmit, onCancel, saving }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void; saving: boolean }) {
  return <FormShell onSubmit={onSubmit} onCancel={onCancel} saving={saving} button="Create Client"><Info text="Keep client information centralized so projects, tasks, requirements and activity can all connect to the correct client." /><Field label="Client / Company Name" name="name" required placeholder="e.g. ABC Fitness" /><Select label="Client Type" name="client_type" options={['Individual', 'Company', 'Agency', 'Startup', 'Enterprise']} required /><Field label="Primary Contact Name" name="contact_name" placeholder="John Smith" /><Field label="Email" name="email" type="email" required placeholder="john@example.com" /><Field label="Phone" name="phone" placeholder="+1 555 000 0000" /><Field label="Website" name="website" type="url" placeholder="https://example.com" /><Select label="Platform" name="platform" options={['Real Estate', 'Healthcare', 'Fitness', 'Insurance', 'E-commerce', 'SaaS', 'Marketing', 'Other']} /><Select label="Lead Source" name="lead_source" options={['Referral', 'Website', 'LinkedIn', 'Upwork', 'Fiverr', 'Cold Outreach', 'Other']} /><Select label="Client Status" name="status" options={['Active', 'Prospect', 'On Hold', 'Completed', 'Archived']} /><Select label="Account Manager" name="account_manager" options={['Usman', 'Team Member']} /><fieldset className="md:col-span-2"><legend className={labelClass}>Preferred Communication</legend><div className="grid grid-cols-1 gap-3 rounded-xl border border-[#292e39] bg-[#0b0e14] p-4 sm:grid-cols-3">{['Email', 'WhatsApp', 'Phone', 'Zoom', 'Google Meet', 'Slack'].map((option) => <label key={option} className="flex items-center gap-2 text-sm text-[#AEB5C3]"><input type="checkbox" name="communication" value={option} className="accent-[#7c5cff]" />{option}</label>)}</div></fieldset><TextArea label="Client Notes" name="client_notes" placeholder="Important client information, preferences or internal notes..." /><TextArea label="Internal Notes" name="internal_notes" placeholder="Private notes visible only to your team..." /></FormShell>;
}

function ProjectForm({ clients, onSubmit, onCancel, saving }: { clients: Client[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void; saving: boolean }) {
  return <FormShell onSubmit={onSubmit} onCancel={onCancel} saving={saving} button="Create Project"><Info text="Every project should belong to a client. Requirements, tasks, tests, fixes and enhancements can then be connected to it." /><Field label="Project Name" name="name" required placeholder="e.g. GHL CRM Setup" /><Select label="Client" name="client_id" options={clients.map((client) => ({ value: client.id, label: client.name || client.company || client.id }))} required /><TextArea label="Project Description" name="description" required wide placeholder="Describe the project scope and objectives..." /><Select label="Project Type" name="project_type" options={['CRM', 'Website', 'Automation', 'Integration', 'SaaS', 'Marketing', 'Other']} /><Select label="Status" name="status" options={['Planning', 'Active', 'On Hold', 'Testing', 'Completed', 'Cancelled']} /><Select label="Priority" name="priority" options={['Low', 'Medium', 'High', 'Critical']} /><Select label="Project Manager" name="project_manager" options={['Usman', 'Team Member']} /><Field label="Start Date" name="start_date" type="date" /><Field label="Target Deadline" name="due_date" type="date" /><Field label="Estimated Hours" name="estimated_hours" type="number" placeholder="40" /><Field label="Project Version" name="version" placeholder="v1.0" /><TextArea label="Project Goals" name="goals" wide placeholder="What should this project achieve?" /><TextArea label="Internal Project Notes" name="internal_notes" wide placeholder="Internal notes, technical details, credentials status, client preferences..." /></FormShell>;
}

function TaskForm({ clients, projects, onSubmit, onCancel, saving }: { clients: Client[]; projects: Project[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void; saving: boolean }) {
  return <FormShell onSubmit={onSubmit} onCancel={onCancel} saving={saving} button="Create Task"><Info text="Tasks are the execution layer. A task can belong to a project and optionally connect to a requirement." /><Field label="Task Title" name="title" required wide placeholder="e.g. Configure GHL appointment workflow" /><Select label="Client" name="client_id" options={clients.map((client) => ({ value: client.id, label: client.name || client.company || client.id }))} required /><Select label="Project" name="project_id" options={projects.map((project) => ({ value: project.id, label: project.name || project.id }))} required /><Select label="Task Type" name="task_type" options={['Development', 'Configuration', 'Design', 'Testing', 'Research', 'Meeting', 'Bug Fix', 'Other']} /><Select label="Priority" name="priority" options={['Low', 'Medium', 'High', 'Critical']} /><Select label="Status" name="status" options={['Backlog', 'Todo', 'In Progress', 'Blocked', 'Review', 'Testing', 'Completed']} /><Select label="Assigned To" name="assigned_to" options={['Usman', 'Team Member']} /><Field label="Start Date" name="start_date" type="date" /><Field label="Due Date" name="due_date" type="date" /><Field label="Estimated Hours" name="estimated_hours" type="number" placeholder="4" /><Field label="Actual Hours" name="actual_hours" type="number" placeholder="0" /><Select label="Requirement" name="requirement" options={['Setup Lead Pipeline', 'Configure Calendar', 'WhatsApp Integration', 'Workflow Automation', 'AI Agents', 'Conversations', 'AI Voice', 'Integrations', 'Communities', 'Courses', 'Contacts', 'Contact Fixes', 'Website', 'Design', 'Landing Page', 'Funnel']} /><TextArea label="Description" name="description" required wide placeholder="Describe exactly what needs to be done..." /><TextArea label="Task Checklist" name="checklist" wide placeholder={'1. Configure workflow\n2. Add trigger\n3. Add actions\n4. Test workflow'} /><Select label="Task Dependency" name="dependency" options={['TASK-001 - Setup account', 'TASK-002 - Configure domain', 'TASK-003 - Create pipeline']} wide /><TextArea label="Internal Notes" name="internal_notes" wide placeholder="Technical notes, credentials needed, blockers, implementation details..." /></FormShell>;
}

function Info({ text }: { text: string }) {
  return <p className="md:col-span-2 rounded-xl border border-[#7c5cff]/20 bg-[#7c5cff]/10 px-4 py-3 text-sm leading-6 text-[#AEB5C3]">{text}</p>;
}

function TextArea({ label, name, required = false, placeholder, wide = false }: { label: string; name: string; required?: boolean; placeholder?: string; wide?: boolean }) {
  return <label className={wide ? 'md:col-span-2' : ''}><span className={labelClass}>{label}{required && <b className="ml-1 text-[#FF5F7A]">*</b>}</span><textarea className={`${inputClass} min-h-28 resize-y`} name={name} required={required} placeholder={placeholder} /></label>;
}
