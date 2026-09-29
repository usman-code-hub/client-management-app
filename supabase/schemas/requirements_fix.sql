CREATE TABLE IF NOT EXISTS requirements (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title TEXT,
	description TEXT,
	project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
	client_id UUID,
	category TEXT DEFAULT 'CRM',
	priority TEXT DEFAULT 'Medium',
	status TEXT DEFAULT 'Pending',
	progress INT DEFAULT 0,
	due_date DATE,
	acceptance_criteria TEXT,
	created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE requirements ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'CRM';
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now();

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = current_schema()
			AND table_name = 'requirements'
			AND column_name = 'text'
	) THEN
		EXECUTE 'UPDATE requirements
			SET title = COALESCE(NULLIF(title, ''''), text)
			WHERE text IS NOT NULL';
		ALTER TABLE requirements DROP COLUMN text;
	END IF;
END $$;

UPDATE requirements
SET status = CASE UPPER(REPLACE(status, '_', ' '))
	WHEN 'OPEN' THEN 'Pending'
	WHEN 'PENDING' THEN 'Pending'
	WHEN 'IN PROGRESS' THEN 'In Progress'
	WHEN 'COMPLETED' THEN 'Completed'
	WHEN 'TESTING' THEN 'Testing'
	WHEN 'REVIEW' THEN 'Review'
	ELSE status
END
WHERE status IS NOT NULL;

UPDATE requirements
SET priority = CASE UPPER(priority)
	WHEN 'LOW' THEN 'Low'
	WHEN 'MEDIUM' THEN 'Medium'
	WHEN 'HIGH' THEN 'High'
	WHEN 'CRITICAL' THEN 'Critical'
	ELSE priority
END
WHERE priority IS NOT NULL;

ALTER TABLE requirements ALTER COLUMN status SET DEFAULT 'Pending';
ALTER TABLE requirements ALTER COLUMN priority SET DEFAULT 'Medium';

ALTER TABLE requirements DROP CONSTRAINT IF EXISTS requirements_status_check;
ALTER TABLE requirements ADD CONSTRAINT requirements_status_check
	CHECK (status IN ('Pending', 'In Progress', 'Testing', 'Review', 'Completed'));

ALTER TABLE requirements DROP CONSTRAINT IF EXISTS requirements_priority_check;
ALTER TABLE requirements ADD CONSTRAINT requirements_priority_check
	CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'));

ALTER TABLE requirements DROP COLUMN IF EXISTS dependency_id;

NOTIFY pgrst, 'reload schema';
