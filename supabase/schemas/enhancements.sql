CREATE TABLE IF NOT EXISTS enhancements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'REQUESTED',
  priority TEXT DEFAULT 'MEDIUM',
  requested_by TEXT,
  created_at TIMESTAMP DEFAULT now()
);
