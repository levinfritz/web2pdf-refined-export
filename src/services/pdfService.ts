import { supabase } from "@/lib/supabase";
import { PdfSettingsType, ConversionResponse, AuthCredentials } from "@/types/pdf-types";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000';

// Funktion zum Abrufen des JWT-Tokens vom Supabase
async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

// Definiere spezifische Fehlertypen
export class PdfConversionError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'PdfConversionError';
    this.statusCode = statusCode;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentifizierung erforderlich. Bitte melden Sie sich an.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Hauptkonvertierungsfunktion mit JWT-Authentifizierung
export const convertUrlToPdf = async (
  url: string,
  settings: PdfSettingsType,
  userId?: string,
  auth?: AuthCredentials
): Promise<ConversionResponse> => {
  try {
    // Hole JWT-Token von Supabase
    const token = await getAuthToken();
    
    if (!token) {
      throw new AuthenticationError();
    }
    
    // URL-Validierung im Frontend
    if (!isValidUrl(url)) {
      throw new ValidationError('Ungültige URL. Bitte geben Sie eine gültige URL mit Protokoll (http/https) ein.');
    }

    // Entferne Schrägstriche am Anfang von API_ENDPOINT, falls vorhanden
    const endpoint = API_ENDPOINT.replace(/\/+$/, '');
    
    // WICHTIG: Korrekter API-Pfad ohne doppelte /api/
    // Wenn API_ENDPOINT bereits /api enthält, dann nur /convert anfügen
    // sonst /api/convert verwenden
    const apiUrl = endpoint.includes('/api') 
                  ? `${endpoint}/convert` 
                  : `${endpoint}/api/convert`;

    console.log('Verwendeter API-Endpunkt:', apiUrl);
    
    // Sende Anfrage an den Backend-Service mit JWT-Token
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        url,
        settings,
        // Zusätzliche Parameter für die Backend-Verarbeitung
        options: {
          // Wenn removeAds aktiviert ist, sende diese Selektoren zum Entfernen
          adSelectors: settings.removeAds ? [
            '.ad', '.ads', '.advertisement', 
            '[class*="ad-"]', '[class*="advertisement"]', 
            '[id*="ad-"]', '[id*="advertisement"]',
            'iframe[src*="ad"]', 'iframe[src*="doubleclick"]',
            '.social-share', '.newsletter-signup',
            '.cookie-banner', '.popup-overlay'
          ] : []
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Spezifischere Fehlermeldungen basierend auf HTTP-Statuscode
      switch (response.status) {
        case 400:
          throw new ValidationError(errorData.error || 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben.');
        case 401:
        case 403:
          throw new AuthenticationError('Nicht autorisiert. Bitte melden Sie sich erneut an.');
        case 404:
          throw new PdfConversionError('Ressource nicht gefunden. Die URL konnte nicht erreicht werden.', 404);
        case 429:
          throw new PdfConversionError('Zu viele Anfragen. Bitte versuchen Sie es später erneut.', 429);
        case 500:
        case 502:
        case 503:
          throw new PdfConversionError('Serverfehler bei der PDF-Erstellung. Bitte versuchen Sie es später erneut.', response.status);
        default:
          throw new PdfConversionError(errorData.error || 'PDF-Konvertierung fehlgeschlagen', response.status);
      }
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
    
    // Gib den spezifischen Fehler weiter, anstatt ihn zu verschlucken
    if (error instanceof AuthenticationError || 
        error instanceof ValidationError || 
        error instanceof PdfConversionError) {
      throw error;
    }
    
    // Allgemeine Fehler
    throw new PdfConversionError(
      error instanceof Error ? error.message : 'Unbekannter Fehler bei der PDF-Erstellung'
    );
  }
};

// Hilfsfunktion zur erweiterten URL-Validierung im Frontend
function isValidUrl(url: string): boolean {
  try {
    const urlObject = new URL(url);
    
    // Überprüfe, ob das Protokoll http oder https ist
    if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
      return false;
    }
    
    // Überprüfe, ob die Domain gültig ist (kein lokaler Host, keine leere Domain)
    const hostname = urlObject.hostname;
    if (!hostname || hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('::1')) {
      return false;
    }
    
    // Überprüfe, ob die Domain mindestens einen Punkt hat (also eine echte Domain ist)
    if (!hostname.includes('.')) {
      return false;
    }
    
    // Überprüfe auf ungültige Zeichen in der Domain
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(hostname)) {
      return false;
    }
    
    return true;
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
