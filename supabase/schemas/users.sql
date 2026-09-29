CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "users can update their own profile" ON profiles;

CREATE POLICY "public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
