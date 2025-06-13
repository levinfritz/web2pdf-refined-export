const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PDFDocument } = require('pdf-lib');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const dotenv = require('dotenv');
const { exec } = require('child_process');

// Lade Umgebungsvariablen
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = path.join(__dirname, 'output');
const JWT_SECRET = process.env.JWT_SECRET || 'default_unsafe_secret';
const PDF_RETENTION_DAYS = process.env.PDF_RETENTION_DAYS || 14;

// Stelle sicher, dass das Ausgabeverzeichnis existiert
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Konfiguriere CORS für Sicherheit
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://stiefelinho.ch'] // Produktions-Domain
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080', 'http://127.0.0.1:8080', 'http://192.168.1.159:8080'], // Entwicklungsdomains
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate-Limiter für API-Endpunkte
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Limit auf 100 Anfragen pro IP in 15 Minuten
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut'
});

// Middleware für JWT-Authentifizierung
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth Header:', authHeader);
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token);
    
    // In development mode, accept Supabase tokens without verification
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode: Accepting token without verification');
      try {
        // Extract user info from token without verification
        // This is only for development purposes
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('Token payload:', payload);
          req.user = {
            id: payload.sub || 'dev-user-id',
            email: payload.email || 'dev@example.com',
            ...payload
          };
          return next();
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    
    // For production or if token parsing fails, verify with JWT_SECRET
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT Verification Error:', err);
        return res.status(403).json({ error: 'Token ungültig oder abgelaufen' });
      }
      
      console.log('Verified User:', user);
      req.user = user;
      next();
    });
  } else {
    console.log('No Authorization Header');
    res.status(401).json({ error: 'Authentifizierung erforderlich' });
  }
};

// URL-Validierungsfunktion
function validateUrl(url) {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true
  });
}

// Funktion zum Hinzufügen von Metadaten zu PDFs
async function addMetadataToPdf(pdfPath, metadata) {
  try {
    console.log(`Adding metadata to PDF: ${pdfPath}`);
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Setze Metadaten
    if (metadata.title) pdfDoc.setTitle(metadata.title);
    if (metadata.author) pdfDoc.setAuthor(metadata.author);
    if (metadata.subject) pdfDoc.setSubject(metadata.subject);
    if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords);
    pdfDoc.setCreator('Web2PDF+ Tool');
    pdfDoc.setProducer('Web2PDF Refined Export');
    
    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(pdfPath, modifiedPdfBytes);
    console.log(`Metadata successfully added to PDF: ${pdfPath}`);
    return true;
  } catch (error) {
    console.error(`Error adding metadata to PDF: ${error.message}`);
    return false;
  }
}

// Funktion zur PDF-Komprimierung
async function compressPdf(inputPath, outputPath, quality = 'screen') {
  return new Promise((resolve, reject) => {
    console.log(`Compressing PDF: ${inputPath} with quality: ${quality}`);
    
    // Qualitätseinstellungen für die Komprimierung
    const qualitySettings = {
      screen: '-dPDFSETTINGS=/screen',     // niedrige Qualität, kleine Dateigröße
      ebook: '-dPDFSETTINGS=/ebook',       // mittlere Qualität, mittlere Dateigröße
      printer: '-dPDFSETTINGS=/printer',   // hohe Qualität, große Dateigröße
      prepress: '-dPDFSETTINGS=/prepress'  // hohe Qualität, große Dateigröße, Farberhaltung
    };
    
    // Verwende Ghostscript zur Komprimierung, falls verfügbar
    try {
      exec(`gs -sDEVICE=pdfwrite ${qualitySettings[quality]} -dCompatibilityLevel=1.4 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`, (error) => {
        if (error) {
          console.error(`Ghostscript compression error: ${error.message}`);
          // Fallback: Kopiere die Originaldatei, wenn Ghostscript nicht verfügbar ist
          fs.copyFileSync(inputPath, outputPath);
          resolve(false);
        } else {
          console.log(`PDF successfully compressed: ${outputPath}`);
          resolve(true);
        }
      });
    } catch (error) {
      console.error(`Error during PDF compression: ${error.message}`);
      // Fallback: Kopiere die Originaldatei bei Fehlern
      fs.copyFileSync(inputPath, outputPath);
      resolve(false);
    }
  });
}

// Funktion zur Erkennung von CAPTCHAs
async function checkForCaptcha(page) {
  try {
    console.log('Checking for CAPTCHA presence...');
    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      'iframe[src*="captcha"]',
      '.g-recaptcha',
      '#captcha',
      '.captcha',
      'input[name*="captcha"]',
      'div[class*="captcha"]',
      'div[id*="captcha"]'
    ];
    
    for (const selector of captchaSelectors) {
      const captchaElement = await page.$(selector);
      if (captchaElement) {
        console.log(`CAPTCHA detected with selector: ${selector}`);
        return true;
      }
    }
    
    // Prüfe auch auf bestimmte Texte, die auf CAPTCHAs hinweisen könnten
    const pageContent = await page.content();
    const captchaKeywords = ['captcha', 'robot', 'human verification', 'security check', 'prove you\'re human'];
    
    for (const keyword of captchaKeywords) {
      if (pageContent.toLowerCase().includes(keyword.toLowerCase())) {
        console.log(`CAPTCHA keyword detected: ${keyword}`);
        return true;
      }
    }
    
    console.log('No CAPTCHA detected');
    return false;
  } catch (error) {
    console.error(`Error checking for CAPTCHA: ${error.message}`);
    return false;
  }
};

app.use(express.json());
app.use('/output', express.static(OUTPUT_DIR));

// Automatische Bereinigung alter PDFs (auf PDF_RETENTION_DAYS eingestellt)
setInterval(async () => {
  try {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - PDF_RETENTION_DAYS);
    console.log(`Bereinige PDFs älter als ${retentionDate.toISOString()}...`);
    
    const files = fs.readdirSync(OUTPUT_DIR);
    let deletedCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.pdf')) {
        const filePath = path.join(OUTPUT_DIR, file);
        const stats = fs.statSync(filePath);
        const fileCreationTime = new Date(stats.mtime);
        
        if (fileCreationTime < retentionDate) {
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

// Hauptendpunkt für die PDF-Konvertierung mit Rate-Limiting und JWT-Authentifizierung
app.post('/api/convert', apiLimiter, authenticateJWT, async (req, res) => {
  try {
    console.log("PDF-Konvertierung gestartet...");
    const { url, settings } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // URL-Validierung
    if (!validateUrl(url)) {
      return res.status(400).json({ error: 'Ungültige URL. Bitte geben Sie eine gültige URL mit Protokoll (http/https) ein.' });
    }

    console.log(`Converting URL: ${url} with settings:`, settings);

    // Browser starten mit erweiterten Optionen für Ubuntu 24.04
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,720',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      ignoreHTTPSErrors: true,
      timeout: 60000
    });
    
    // Extrahiere den Titel der Webseite für einen beschreibenden Dateinamen
    let pdfName;
    let pageTitle = '';
    let domain = '';
    const page = await browser.newPage();
    console.log(`Fetching title for URL: ${url}`);
    
    try {
      // Setze einen Timeout für die Navigation
      await page.setDefaultNavigationTimeout(30000);
      
      // Füge User-Agent hinzu, um Blocking zu vermeiden
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
      
      // Navigiere zur URL und warte auf das Laden
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      // Prüfe auf CAPTCHA
      const hasCaptcha = await checkForCaptcha(page);
      if (hasCaptcha) {
        console.warn('CAPTCHA detected on the page. PDF generation may be incomplete.');
      }
      
      // Extrahiere den Seitentitel
      pageTitle = await page.title();
      console.log(`Extracted page title: "${pageTitle}"`);
      
      // Extrahiere die Domain für Metadaten
      try {
        domain = new URL(url).hostname;
      } catch (urlError) {
        domain = 'unknown-domain';
      }
      
      // Generiere einen sicheren Dateinamen basierend auf dem Titel
      let safeTitle = pageTitle && pageTitle.trim() !== ''
        ? pageTitle.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '-').replace(/-+/g, '-').substring(0, 50)
        : domain.replace(/[^a-zA-Z0-9]/g, '-');
      
      // Entferne führende und nachfolgende Bindestriche
      safeTitle = safeTitle.replace(/^-+|-+$/g, '');
      
      // Stelle sicher, dass der Dateiname eindeutig ist mit Timestamp und kurzer ID
      const timestamp = new Date().toISOString().slice(0, 10);
      const shortId = uuidv4().split('-')[0];
      pdfName = `${safeTitle}-${timestamp}-${shortId}.pdf`;
      console.log(`Generated PDF filename: ${pdfName}`);
    } catch (error) {
      console.error(`Error extracting page title: ${error.message}`);
      // Fallback auf Domain-Namen bei Fehler
      try {
        domain = new URL(url).hostname;
        const timestamp = new Date().toISOString().slice(0, 10);
        const shortId = uuidv4().split('-')[0];
        pdfName = `${domain}-${timestamp}-${shortId}.pdf`;
      } catch (urlError) {
        // Absoluter Fallback bei URL-Parsing-Fehler
        const timestamp = new Date().toISOString().slice(0, 10);
        const shortId = uuidv4();
        pdfName = `webpage-${timestamp}-${shortId}.pdf`;
      }
      console.log(`Using fallback PDF filename: ${pdfName}`);
    } finally {
      // Schließe die Seite, die nur für den Titel geöffnet wurde
      await page.close();
    }
    
    // Erstelle den vollständigen Pfad für die PDF-Datei
    const pdfPath = path.join(OUTPUT_DIR, pdfName);
    
    // Temporärer Pfad für die unkomprimierte PDF
    const tempPdfPath = path.join(OUTPUT_DIR, `temp-${pdfName}`);
    
    // PDF erzeugen
    if (settings.includeSubpages) {
      await generatePdfWithSubpages(browser, url, tempPdfPath, settings);
    } else {
      await generateSinglePagePdf(browser, url, tempPdfPath, settings);
    }
    
    // Browser schließen
    await browser.close();
    
    // Füge Metadaten zur PDF hinzu
    const metadata = {
      title: pageTitle || `Web2PDF Export - ${domain || 'Unknown Website'}`,
      author: req.user.email || 'Web2PDF User',
      subject: `PDF export of ${url}`,
      keywords: ['web2pdf', 'export', domain, 'pdf']
    };
    
    await addMetadataToPdf(tempPdfPath, metadata);
    
    // Komprimiere die PDF mit Ghostscript
    const compressionQuality = settings.compressionLevel || 'ebook'; // Verwende die Einstellung oder Standardqualität
    const compressedPdfPath = path.join(OUTPUT_DIR, pdfName);
    await compressPdf(tempPdfPath, compressedPdfPath, compressionQuality);
    
    // Lösche die temporäre unkomprimierte PDF
    try {
      if (fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
        console.log(`Temporary PDF deleted: ${tempPdfPath}`);
      }
    } catch (error) {
      console.error(`Error deleting temporary PDF: ${error.message}`);
      // Nicht kritisch, fahre fort
    }
    
    // Öffentliche URL für den Zugriff auf die PDF mit korrigiertem Host
    let host = req.get('host');
    // Verwende immer localhost für die Entwicklung
    if (process.env.NODE_ENV === 'development') {
      host = 'localhost:3000';
    }
    const pdfUrl = `${req.protocol}://${host}/output/${pdfName}`;
    
    console.log(`PDF erfolgreich erstellt: ${pdfUrl}`);
    
    // Antwort an den Client
    res.json({
      success: true,
      pdfUrl,
      previewUrl: pdfUrl,
      metadata: {
        title: metadata.title,
        fileSize: fs.statSync(pdfPath).size,
        compressionLevel: compressionQuality,
        createdAt: new Date().toISOString()
      }
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
app.delete('/api/history/delete/:id', apiLimiter, authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!id) {
      return res.status(400).json({ error: 'ID ist erforderlich' });
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
app.delete('/api/history/clear/:userId', apiLimiter, authenticateJWT, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Zugriff verweigert: Sie können nur Ihren eigenen Verlauf löschen' });
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

// Endpunkt zum Aktualisieren von PDF-Metadaten
app.post('/api/update-metadata', apiLimiter, authenticateJWT, async (req, res) => {
  try {
    const { pdfId, metadata } = req.body;

    if (!pdfId || !metadata) {
      return res.status(400).json({ error: 'PDF-ID und Metadaten sind erforderlich' });
    }

    // Überprüfe, ob die PDF existiert
    const pdfPath = path.join(OUTPUT_DIR, `${pdfId}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF nicht gefunden' });
    }

    // Validiere die Metadaten
    const validMetadata = {
      title: metadata.title || '',
      author: metadata.author || '',
      subject: metadata.subject || '',
      keywords: Array.isArray(metadata.keywords) ? metadata.keywords : []
    };

    // Aktualisiere die Metadaten in der PDF
    await addMetadataToPdf(pdfPath, validMetadata);

    res.json({
      success: true,
      message: 'Metadaten erfolgreich aktualisiert',
      metadata: {
        ...validMetadata,
        fileSize: fs.statSync(pdfPath).size,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Metadaten:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update metadata',
      details: error.message
    });
  }
});

// Einfache PDF-Generierung für eine einzelne Seite
async function generateSinglePagePdf(browser, url, pdfPath, settings) {
  const page = await browser.newPage();

  // Erhöhe den Timeout auf 60 Sekunden und füge zusätzliche Optionen hinzu
  await page.goto(url, { 
    waitUntil: 'networkidle2',
    timeout: 60000,
    waitForSelector: 'body'
  });
  
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