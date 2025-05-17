import { supabase } from "@/lib/supabase";
import { PdfSettingsType, ConversionResponse } from "@/types/pdf-types";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000';

// This is a mock service that simulates the PDF generation
// In a real application, this would connect to a backend service
export const convertUrlToPdf = async (
  url: string,
  settings: PdfSettingsType,
  userId?: string
): Promise<ConversionResponse> => {
  try {
    // Sende Anfrage an den Backend-Service
    const response = await fetch(`${API_ENDPOINT}/api/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        settings,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('PDF conversion failed');
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
    throw new Error('Failed to convert webpage to PDF');
  }
};

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
