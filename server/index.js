const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PDFDocument } = require('pdf-lib');

const app = express();
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = path.join(__dirname, 'output');

// Stelle sicher, dass das Ausgabeverzeichnis existiert
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/output', express.static(OUTPUT_DIR));

// Automatische Bereinigung alter PDFs (älter als 7 Tage)
setInterval(async () => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    console.log(`Bereinige PDFs älter als ${oneWeekAgo.toISOString()}...`);
    
    const files = fs.readdirSync(OUTPUT_DIR);
    let deletedCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.pdf')) {
        const filePath = path.join(OUTPUT_DIR, file);
        const stats = fs.statSync(filePath);
        const fileCreationTime = new Date(stats.mtime);
        
        if (fileCreationTime < oneWeekAgo) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    }
    
    console.log(`Bereinigung abgeschlossen. ${deletedCount} PDFs gelöscht.`);
  } catch (error) {
    console.error('Fehler bei der automatischen Bereinigung:', error);
  }
}, 24 * 60 * 60 * 1000); // Einmal täglich prüfen

// Root-Endpunkt für Statusprüfung
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Web2PDF+ API Server ist aktiv',
    endpoints: {
      convert: '/api/convert',
      output: '/output/{filename}',
      delete: '/api/history/delete/:id',
      clearAll: '/api/history/clear/:userId'
    }
  });
});

// Hauptendpunkt für die PDF-Konvertierung
app.post('/api/convert', async (req, res) => {
  try {
    const { url, settings, userId } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Converting URL: ${url} with settings:`, settings);

    // PDF-Name und -Pfad generieren
    const pdfId = uuidv4();
    const pdfName = `${pdfId}.pdf`;
    const pdfPath = path.join(OUTPUT_DIR, pdfName);
    
    // Browser starten
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // PDF erzeugen
    if (settings.includeSubpages) {
      await generatePdfWithSubpages(browser, url, pdfPath, settings);
    } else {
      await generateSinglePagePdf(browser, url, pdfPath, settings);
    }
    
    // Browser schließen
    await browser.close();
    
    // Öffentliche URL für den Zugriff auf die PDF
    const pdfUrl = `${req.protocol}://${req.get('host')}/output/${pdfName}`;
    
    console.log(`PDF erfolgreich erstellt: ${pdfUrl}`);
    
    // Antwort an den Client
    res.json({
      success: true,
      pdfUrl,
      previewUrl: pdfUrl
    });
  } catch (error) {
    console.error('Fehler bei der PDF-Konvertierung:', error);
    res.status(500).json({
      success: false,
      error: 'PDF conversion failed',
      details: error.message
    });
  }
});

// Endpunkt zum Löschen eines einzelnen Verlaufseintrags
app.delete('/api/history/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!id || !userId) {
      return res.status(400).json({ error: 'ID und User ID sind erforderlich' });
    }

    // In einer echten Anwendung würdest du hier mit einer Supabase-API arbeiten
    console.log(`Lösche Verlaufseintrag mit ID ${id} für Benutzer ${userId}...`);
    
    // Rückgabe eines Erfolgs, in der realen Anwendung würde hier die Datenbankoperation stattfinden
    res.json({ success: true, message: 'Verlaufseintrag erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Verlaufseintrags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete history entry',
      details: error.message
    });
  }
});

// Endpunkt zum Löschen aller Verlaufseinträge eines Benutzers
app.delete('/api/history/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID ist erforderlich' });
    }

    // In einer echten Anwendung würdest du hier mit einer Supabase-API arbeiten
    console.log(`Lösche gesamten Verlauf für Benutzer ${userId}...`);
    
    // Rückgabe eines Erfolgs, in der realen Anwendung würde hier die Datenbankoperation stattfinden
    res.json({ success: true, message: 'Verlauf erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Verlaufs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear history',
      details: error.message
    });
  }
});

// Einfache PDF-Generierung für eine einzelne Seite
async function generateSinglePagePdf(browser, url, pdfPath, settings) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // PDF-Optionen basierend auf den Einstellungen konfigurieren
  const pdfOptions = getPdfOptions(settings);
  
  // PDF erzeugen
  await page.pdf({
    path: pdfPath,
    ...pdfOptions
  });
}

// PDF-Generierung mit Unterseiten
async function generatePdfWithSubpages(browser, url, pdfPath, settings) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Erstelle temporären Ordner für Einzelseiten
  const tempDir = path.join(OUTPUT_DIR, 'temp', uuidv4());
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Extrahiere alle internen Links
  console.log(`Extrahiere interne Links von ${url}...`);
  const internalLinks = await page.evaluate((baseUrl) => {
    const domain = new URL(baseUrl).hostname;
    const links = Array.from(document.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href && href.includes(domain))
      .filter(href => !href.includes('#')) // Ignoriere Anker-Links
      .filter(href => {
        try {
          return new URL(href).pathname !== '/';
        } catch (e) {
          return false;
        }
      });
    return [...new Set(links)]; // Entferne Duplikate
  }, url);
  
  console.log(`Gefundene interne Links: ${internalLinks.length}`);
  
  // Maximale Anzahl von zu verarbeitenden Unterseiten
  const maxSubpages = settings.maxSubpages || 10;
  const subpagesToProcess = internalLinks.slice(0, maxSubpages);
  
  // Erstelle PDF für die Hauptseite
  const mainPagePdfPath = path.join(tempDir, '0_main.pdf');
  await page.pdf({
    path: mainPagePdfPath,
    ...getPdfOptions(settings)
  });
  
  console.log('Hauptseite konvertiert. Verarbeite Unterseiten...');
  
  // Verarbeite alle Unterseiten
  const pdfFiles = [mainPagePdfPath];
  for (let i = 0; i < subpagesToProcess.length; i++) {
    const subpageUrl = subpagesToProcess[i];
    console.log(`Verarbeite Unterseite ${i+1}/${subpagesToProcess.length}: ${subpageUrl}`);
    
    try {
      await page.goto(subpageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const subpagePdfPath = path.join(tempDir, `${i+1}_${path.basename(subpageUrl)}.pdf`);
      await page.pdf({
        path: subpagePdfPath,
        ...getPdfOptions(settings)
      });
      
      pdfFiles.push(subpagePdfPath);
    } catch (error) {
      console.error(`Fehler beim Verarbeiten der Unterseite ${subpageUrl}:`, error.message);
    }
  }
  
  // Füge alle PDFs zusammen mit pdf-lib
  console.log('Füge PDFs zusammen...');
  await mergePDFs(pdfFiles, pdfPath);
  
  console.log(`PDF mit ${pdfFiles.length} Seiten erstellt.`);
  
  // Räume temporäre Dateien auf
  pdfFiles.forEach(file => {
    try { fs.unlinkSync(file); } catch (e) { /* ignorieren */ }
  });
  try { fs.rmdirSync(tempDir, { recursive: true }); } catch (e) { /* ignorieren */ }
}

// Funktion zum Zusammenführen von PDFs mit pdf-lib
async function mergePDFs(pdfPaths, outputPath) {
  const mergedPdf = await PDFDocument.create();
  
  for (const pdfPath of pdfPaths) {
    try {
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    } catch (error) {
      console.error(`Fehler beim Verarbeiten der PDF ${pdfPath}:`, error.message);
    }
  }
  
  const mergedPdfBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedPdfBytes);
}

// Hilfsfunktion zur Konvertierung der Frontend-Einstellungen in Puppeteer-Optionen
function getPdfOptions(settings = {}) {
  const options = {
    printBackground: true,
  };

  // Papierformat
  if (settings.paperSize) {
    options.format = settings.paperSize.toLowerCase();
  }

  // Ausrichtung
  if (settings.orientation) {
    options.landscape = settings.orientation === 'landscape';
  }

  // Ränder
  if (settings.margins) {
    switch (settings.margins) {
      case 'none':
        options.margin = { top: '0', right: '0', bottom: '0', left: '0' };
        break;
      case 'small':
        options.margin = { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' };
        break;
      case 'normal':
        options.margin = { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' };
        break;
      case 'large':
        options.margin = { top: '30mm', right: '30mm', bottom: '30mm', left: '30mm' };
        break;
    }
  }

  // Skalierung (Schriftgröße)
  if (settings.fontSize) {
    options.scale = settings.fontSize / 100;
  }

  return options;
}

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
}); 