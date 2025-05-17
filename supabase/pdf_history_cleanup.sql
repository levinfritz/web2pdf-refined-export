-- Diese SQL-Befehle müssen in der Supabase SQL-Konsole ausgeführt werden

-- Erstelle eine Funktion zum Löschen alter Einträge (älter als 7 Tage)
CREATE OR REPLACE FUNCTION cleanup_old_history()
RETURNS void AS $$
BEGIN
  -- Lösche Einträge, die älter als 7 Tage sind
  DELETE FROM pdf_history
  WHERE created_at < (NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Erstelle einen Trigger, der die Funktion täglich aufruft
SELECT cron.schedule(
  'daily-history-cleanup', -- Name des Zeitplans
  '0 0 * * *',             -- Cron-Expression: Um Mitternacht jeden Tag
  'SELECT cleanup_old_history();' -- SQL-Befehl, der ausgeführt werden soll
);

-- MANUELL IN DER SUPABASE KONSOLE AUSZUFÜHRENDE BEFEHLE:

-- 1. Stelle sicher, dass die Erweiterung pg_cron aktiviert ist:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Erstelle die Tabelle, falls sie noch nicht existiert:
-- CREATE TABLE IF NOT EXISTS pdf_history (
--   id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
--   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
--   url text NOT NULL,
--   title text NOT NULL,
--   pdf_url text NOT NULL,
--   created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
-- );

-- 3. Funktion zum Löschen eines einzelnen Verlaufseintrags
CREATE OR REPLACE FUNCTION delete_history_entry(entry_id UUID, user_uuid UUID)
RETURNS boolean AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM pdf_history
  WHERE id = entry_id AND user_id = user_uuid
  RETURNING id INTO deleted_count;
  
  RETURN deleted_count IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Funktion zum Löschen aller Einträge eines Benutzers
CREATE OR REPLACE FUNCTION clear_user_history(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM pdf_history
  WHERE user_id = user_uuid
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql; 