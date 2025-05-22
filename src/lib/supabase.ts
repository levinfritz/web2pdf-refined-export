import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Da die aktuelle Version von supabase-js nicht direkt HTTPOnly-Cookies unterstützt,
// müssen wir einen alternativen Ansatz verwenden. In einer Produktionsumgebung
// sollte ein Backend-Proxy für die Authentifizierung eingerichtet werden.

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'web2pdf-auth-token',
    detectSessionInUrl: true,
    flowType: 'pkce',  // PKCE ist sicherer als impliziter Flow
  }
});

// In einer echten Produktion sollte ein Server-Side Auth-Flow verwendet werden.
// Hinweis: Um HTTPOnly-Cookies zu implementieren, benötigt man ein serverseitiges Setup,
// das die Authentifizierung verwaltet und die Cookies mit den richtigen Flags setzt.
// Das ist nicht vollständig möglich in einer reinen Client-Anwendung.
