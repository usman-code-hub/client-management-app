
import React from 'react';
import { CheckCircle, CheckCircle2, Circle, ClipboardCheck, Clock, Eye, ListTodo, Loader, Loader2, XCircle } from 'lucide-react';

const statusDefinitions = {
  completed: { background: '#123B2A', text: '#4ADE80', border: '#166534', icon: CheckCircle },
  passed: { background: '#123B2A', text: '#4ADE80', border: '#166534', icon: CheckCircle2 },
  failed: { background: '#3B1518', text: '#F87171', border: '#991B1B', icon: XCircle },
  review: { background: '#3A2F0B', text: '#FACC15', border: '#854D0E', icon: ClipboardCheck },
  in_progress: { background: '#3B2110', text: '#FB923C', border: '#9A3412', icon: Loader },
  testing: { background: '#3B2110', text: '#FB923C', border: '#9A3412', icon: Loader2 },
  todo: { background: '#281545', text: '#C084FC', border: '#7E22CE', icon: ListTodo },
  not_started: { background: '#281545', text: '#C084FC', border: '#7E22CE', icon: Circle },
  not_tested: { background: '#281545', text: '#C084FC', border: '#7E22CE', icon: Circle },
  pending: { background: '#24262D', text: '#A1A1AA', border: '#52525B', icon: Clock },
  blocked: { background: '#3B1518', text: '#F87171', border: '#991B1B', icon: XCircle },
  open: { background: '#3B2110', text: '#FB923C', border: '#9A3412', icon: Clock },
  resolved: { background: '#123B2A', text: '#4ADE80', border: '#166534', icon: CheckCircle },
  closed: { background: '#123B2A', text: '#4ADE80', border: '#166534', icon: CheckCircle },
  active: { background: '#3B2110', text: '#FB923C', border: '#9A3412', icon: Loader },
  approved: { background: '#281545', text: '#C084FC', border: '#7E22CE', icon: CheckCircle },
  planning: { background: '#281545', text: '#C084FC', border: '#7E22CE', icon: ListTodo },
  new: { background: '#281545', text: '#C084FC', border: '#7E22CE', icon: ListTodo },
  on_hold: { background: '#3A2F0B', text: '#FACC15', border: '#854D0E', icon: Clock },
  cancelled: { background: '#3B1518', text: '#F87171', border: '#991B1B', icon: XCircle },
  archived: { background: '#24262D', text: '#A1A1AA', border: '#52525B', icon: Clock }
};

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase().replace(/[ -]+/g, '_');
}

const StatusBadge = ({ status }) => {
  const label = String(status || 'Unknown').trim() || 'Unknown';
  const key = normalizeStatus(label);
  const definition = statusDefinitions[key];

  if (!definition && import.meta.env?.DEV) console.warn(`[StatusBadge] Unknown status: ${label}`);

  const style = definition || { background: '#24262D', text: '#A1A1AA', border: '#52525B', icon: Circle };
  const Icon = style.icon;

  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-xs font-semibold"
      style={{ backgroundColor: style.background, color: style.text, borderColor: style.border }}
    >
      <Icon size={14} strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  );
};

export default StatusBadge;
