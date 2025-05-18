-- Diese SQL-Befehle müssen in der Supabase SQL-Konsole ausgeführt werden

-- Anmerkung: Die pg_cron Erweiterung ist in der Standard-Supabase-Instanz nicht verfügbar.
-- Sie können stattdessen einen Webhook oder eine serverseitige Funktion verwenden,
-- um alte Einträge regelmäßig zu löschen.

-- Erstelle eine Funktion zum Löschen alter Einträge (älter als 7 Tage)
CREATE OR REPLACE FUNCTION cleanup_old_history()
RETURNS void AS $$
BEGIN
  -- Lösche Einträge, die älter als 7 Tage sind
  DELETE FROM pdf_history
  WHERE created_at < (NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Hinweis: Da die cron-Erweiterung nicht verfügbar ist, können Sie diese Funktion manuell
-- über einen Edge-Function oder einen externen Scheduler aufrufen.
-- Alternativ kann die Funktion bei jedem Laden der History-Seite aufgerufen werden:
-- SELECT cleanup_old_history();

-- MANUELL IN DER SUPABASE KONSOLE AUSZUFÜHRENDE BEFEHLE:

-- 1. Stelle sicher, dass die benötigten Erweiterungen aktiviert sind:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Erstelle die Tabelle, falls sie noch nicht existiert:
CREATE TABLE IF NOT EXISTS pdf_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  title text NOT NULL,
  pdf_url text NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Enable Row Level Security (RLS) on the table
ALTER TABLE pdf_history ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow users to select only their own records
CREATE POLICY select_own_history ON pdf_history 
  FOR SELECT USING (auth.uid() = user_id);
  
-- 5. Create policy to allow users to insert only their own records
CREATE POLICY insert_own_history ON pdf_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
-- 6. Create policy to allow users to delete only their own records
CREATE POLICY delete_own_history ON pdf_history 
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Funktion zum Löschen eines einzelnen Verlaufseintrags
CREATE OR REPLACE FUNCTION delete_history_entry(entry_id UUID, user_uuid UUID)
RETURNS boolean AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Verify the user is the same as auth.uid() for security
  IF user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own entries';
  END IF;

  DELETE FROM pdf_history
  WHERE id = entry_id AND user_id = user_uuid
  RETURNING 1 INTO deleted_count;
  
  RETURN deleted_count IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Funktion zum Löschen aller Einträge eines Benutzers
CREATE OR REPLACE FUNCTION clear_user_history(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Verify the user is the same as auth.uid() for security
  IF user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You can only clear your own history';
  END IF;

  WITH deleted AS (
    DELETE FROM pdf_history
    WHERE user_id = user_uuid
    RETURNING *
  )
  SELECT count(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 