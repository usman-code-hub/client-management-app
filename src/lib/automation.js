
import { supabase } from './supabase';

/**
 * Automatically creates an entry in the Activity table
 * @param {string} type - Activity type (Note, System, Update, etc.)
 * @param {Object} payload - { clientId, projectId, title, description, entityType, entityId }
 */
export const logActivity = async (type, payload) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert([
      {
        action: type,
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        description: payload.description,
        created_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Automation Error: Failed to log activity', error);
    return { success: false, error };
  }
  return { success: true, data };
};

/**
 * Specific trigger for Testing Failure
 */
export const handleTestFailure = async (testCase) => {
  return await logActivity('System', {
    clientId: testCase.clientId,
    projectId: testCase.projectId,
    title: `Test Case Failed: ${testCase.title}`,
    description: `Expected: ${testCase.expected}. Actual: ${testCase.actual}. A Fix should be created.`,
    entityType: 'Test',
    entityId: testCase.id
  });
};

/**
 * Specific trigger for Enhancement Approval
 */
export const handleEnhancementApproval = async (enhancement) => {
  return await logActivity('System', {
    clientId: enhancement.clientId,
    projectId: enhancement.projectId,
    title: `Enhancement Approved: ${enhancement.title}`,
    description: `Client approved the enhancement. A task will be generated.`,
    entityType: 'Enhancement',
    entityId: enhancement.id
  });
};
