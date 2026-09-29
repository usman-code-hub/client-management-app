CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public activity logs access" ON activity_logs;
CREATE POLICY "public activity logs access"
ON activity_logs FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
