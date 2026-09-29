-- Run this in Supabase SQL Editor.
-- Safely adds any columns that are missing, without touching existing data.

ALTER TABLE clients ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_type TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS account_manager TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS communication TEXT[] DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- If your old table still has the "name" column and you no longer use it,
-- you can drop it (optional, only if nothing else reads it):
-- ALTER TABLE clients DROP COLUMN IF EXISTS name;

-- Make sure RLS won't silently block inserts:
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all inserts" ON clients;
CREATE POLICY "Allow all inserts" ON clients FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all reads" ON clients;
CREATE POLICY "Allow all reads" ON clients FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all updates" ON clients;
CREATE POLICY "Allow all updates" ON clients FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow all deletes" ON clients;
CREATE POLICY "Allow all deletes" ON clients FOR DELETE USING (true);

-- Force PostgREST to refresh its schema cache (this is what actually
-- causes "Could not find the 'x' column ... in the schema cache" —
-- the cache is stale even after the column exists).
NOTIFY pgrst, 'reload schema';