ALTER TABLE fixes ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE fixes ADD COLUMN IF NOT EXISTS problem TEXT;
ALTER TABLE fixes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE fixes ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE fixes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Open';
ALTER TABLE fixes ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE fixes ADD COLUMN IF NOT EXISTS root_cause TEXT;
ALTER TABLE fixes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now();
ALTER TABLE fixes ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Testing';
ALTER TABLE fixes ADD COLUMN IF NOT EXISTS regression_risk BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE fixes ADD COLUMN IF NOT EXISTS fixed_version TEXT;

UPDATE fixes
SET status = CASE UPPER(status)
	WHEN 'OPEN' THEN 'Open'
	WHEN 'RESOLVED' THEN 'Resolved'
	WHEN 'CLOSED' THEN 'Closed'
	ELSE status
END
WHERE status IS NOT NULL;

UPDATE fixes
SET priority = CASE UPPER(priority)
	WHEN 'LOW' THEN 'Low'
	WHEN 'MEDIUM' THEN 'Medium'
	WHEN 'HIGH' THEN 'High'
	WHEN 'CRITICAL' THEN 'Critical'
	ELSE priority
END
WHERE priority IS NOT NULL;

ALTER TABLE fixes ALTER COLUMN status SET DEFAULT 'Open';
ALTER TABLE fixes ALTER COLUMN priority SET DEFAULT 'Medium';
ALTER TABLE fixes ALTER COLUMN source SET DEFAULT 'Testing';

ALTER TABLE fixes DROP CONSTRAINT IF EXISTS fixes_status_check;
ALTER TABLE fixes ADD CONSTRAINT fixes_status_check
	CHECK (status IN ('Open', 'Resolved', 'Closed'));

ALTER TABLE fixes DROP CONSTRAINT IF EXISTS fixes_priority_check;
ALTER TABLE fixes ADD CONSTRAINT fixes_priority_check
	CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'));

ALTER TABLE fixes DROP CONSTRAINT IF EXISTS fixes_source_check;
ALTER TABLE fixes ADD CONSTRAINT fixes_source_check
	CHECK (source IN ('Testing', 'Client', 'QA'));

NOTIFY pgrst, 'reload schema';
