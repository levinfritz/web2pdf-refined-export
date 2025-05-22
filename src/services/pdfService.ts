import { supabase } from "@/lib/supabase";
import { PdfSettingsType, ConversionResponse } from "@/types/pdf-types";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000';

// Funktion zum Abrufen des JWT-Tokens vom Supabase
async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

// Hauptkonvertierungsfunktion mit JWT-Authentifizierung
export const convertUrlToPdf = async (
  url: string,
  settings: PdfSettingsType,
  userId?: string,
  auth?: { username: string; password: string }
): Promise<ConversionResponse> => {
  try {
    // Hole JWT-Token von Supabase
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentifizierung erforderlich. Bitte melden Sie sich an.');
    }
    
    // URL-Validierung im Frontend
    if (!isValidUrl(url)) {
      throw new Error('Ungültige URL. Bitte geben Sie eine gültige URL mit Protokoll (http/https) ein.');
    }

    // Sende Anfrage an den Backend-Service mit JWT-Token
    const response = await fetch(`${API_ENDPOINT}/api/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        url,
        settings
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'PDF conversion failed');
    }

    const data = await response.json();
    
    // Wenn ein Benutzer eingeloggt ist, speichere den Eintrag in der Historie
    if (userId) {
      try {
        await supabase.from('pdf_history').insert({
          user_id: userId,
          url: url,
          title: await fetchPageTitle(url),
          pdf_url: data.pdfUrl,
        });
      } catch (error) {
        console.error('Error saving to history:', error);
        // Wir werfen den Fehler hier nicht, da die Konvertierung trotzdem erfolgreich war
      }
    }
    
    return {
      success: true,
      pdfUrl: data.pdfUrl,
      previewUrl: data.previewUrl || data.pdfUrl,
    };
  } catch (error) {
    console.error('Error converting PDF:', error);
    throw error;
  }
};

// Hilfsfunktion zur URL-Validierung im Frontend
function isValidUrl(url: string): boolean {
  try {
    const urlObject = new URL(url);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch {
    return false;
  }
}

// Hilfsfunktion zum Abrufen des Seitentitels
async function fetchPageTitle(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const match = html.match(/<title>(.*?)<\/title>/i);
    return match ? match[1] : url;
  } catch (error) {
    console.error('Error fetching page title:', error);
    return url;
  }
}

// In a real implementation, you would define the required API endpoints:
// 1. POST /api/convert - to submit a URL and settings for conversion
// 2. GET /api/status/:jobId - to check conversion status
// 3. GET /api/download/:jobId - to download the generated PDF
