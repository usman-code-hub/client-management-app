CREATE TABLE IF NOT EXISTS final_rechecks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING',
  reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);
