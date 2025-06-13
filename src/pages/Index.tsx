import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Header from "@/components/Header";
import UrlForm from "@/components/UrlForm";
import PdfSettings from "@/components/PdfSettings";
import PdfPreview from "@/components/PdfPreview";
import { PdfSettingsType, PdfMetadataType, PdfMetadataResponse } from "@/types/pdf-types";
import { convertUrlToPdf, updatePdfMetadata } from "@/services/pdfService";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/auth/AuthDialog";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [settings, setSettings] = useState<PdfSettingsType>({
    paperSize: "A4",
    orientation: "portrait",
    margins: "normal",
    includeImages: true,
    preserveLinks: true,
    removeAds: true,
    theme: "auto",
    fontSize: 100,
    stylePreset: "default",
    includeSubpages: false,
    maxSubpages: 10,
    compressionLevel: "ebook", // Standardmäßig mittlere Komprimierung
  });
  
  const [pdfMetadata, setPdfMetadata] = useState<PdfMetadataResponse | null>(null);
  const [editedMetadata, setEditedMetadata] = useState<PdfMetadataType>({
    title: "",
    author: "",
    subject: "",
    keywords: []
  });

  // Handle URL from route parameters (for re-generation from history)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlParam = urlParams.get("url");
    
    if (urlParam && user) {
      handleUrlSubmit(urlParam);
    } else if (urlParam && !user) {
      setAuthDialogOpen(true);
      toast.info("Bitte melde dich an oder erstelle einen Account, um PDFs zu generieren");
    }
  }, [location.search, user]);

  // Animierte Toast-Funktion
  const showAnimatedToast = (message: string, type: 'success' | 'error' | 'info') => {
    toast[type](message, {
      className: "animate-in slide-in-from-top-full duration-300",
      duration: 3000,
    });
  };

  const handleUrlSubmit = async (submittedUrl: string, auth?: { username: string; password: string }) => {
    if (!user) {
      setAuthDialogOpen(true);
      showAnimatedToast("Bitte melde dich an oder erstelle einen Account, um PDFs zu generieren", "info");
      return;
    }
    
    setUrl(submittedUrl);
    setIsLoading(true);
    setPdfMetadata(null);
    try {
      const result = await convertUrlToPdf(submittedUrl, settings, user?.id, auth);
      setPdfUrl(result.pdfUrl);
      setPreviewUrl(result.previewUrl);
      
      // Metadaten verarbeiten, wenn vorhanden
      if (result.metadata) {
        setPdfMetadata(result.metadata);
        
        // Initialisiere die bearbeitbaren Metadaten
        setEditedMetadata({
          title: result.metadata.title || "",
          author: user?.email || "",
          subject: "Webseiten-Export",
          keywords: [new URL(submittedUrl).hostname.replace(/^www\./, '')]
        });
      }
      
      showAnimatedToast("PDF erfolgreich erstellt!", "success");
    } catch (error) {
      console.error("Error converting PDF:", error);
      showAnimatedToast("Fehler bei der PDF-Erstellung", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (newSettings: Partial<PdfSettingsType>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };
  
  const handleMetadataChange = (newMetadata: PdfMetadataType) => {
    setEditedMetadata(newMetadata);
  };
  
  const handleMetadataSave = async () => {
    if (!pdfUrl || !pdfMetadata) return;
    
    try {
      setIsLoading(true);
      await updatePdfMetadata(pdfUrl, editedMetadata);
      showAnimatedToast("Metadaten erfolgreich aktualisiert!", "success");
      
      // Aktualisiere die Metadaten im State
      if (pdfMetadata) {
        setPdfMetadata({
          ...pdfMetadata,
          title: editedMetadata.title
        });
      }
    } catch (error) {
      console.error("Error updating metadata:", error);
      showAnimatedToast("Fehler beim Aktualisieren der Metadaten", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      // Extrahiere den Domainnamen aus der URL für einen besseren Dateinamen
      let fileName = "web2pdf";
      try {
        if (url) {
          const urlObj = new URL(url);
          const domain = urlObj.hostname.replace(/^www\./, '');
          const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
          fileName = `${domain}_${date}`;
        }
      } catch (error) {
        console.error("Error creating filename:", error);
      }

      // Erstelle einen Link-Element und simuliere einen Klick für direkten Download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `${fileName}.pdf`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Öffne das PDF zusätzlich in einem neuen Tab
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="container max-w-6xl px-4 pb-16 animate-in fade-in duration-500">
      <Header />
      
      <main className="py-4 md:py-8">
        <Card className="glass-card conversion-card mb-4 md:mb-8 overflow-hidden animate-in slide-in-from-top duration-300">
          <CardContent className="p-4 md:p-6">
            <UrlForm onUrlSubmit={handleUrlSubmit} isLoading={isLoading} />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="glass-card md:col-span-1 order-2 md:order-1 animate-in slide-in-from-left duration-500 delay-150">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-medium mb-4">PDF Settings</h2>
              <PdfSettings 
                settings={settings} 
                onSettingsChange={handleSettingsChange} 
                disabled={isLoading}
              />
            </CardContent>
          </Card>
          
          <Card className="glass-card md:col-span-2 order-1 md:order-2 animate-in slide-in-from-right duration-500 delay-150">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-lg font-medium mb-2 sm:mb-0">Preview</h2>
                {pdfUrl && (
                  <Button onClick={handleDownload} className="gap-2 w-full sm:w-auto transition-all duration-300 hover:bg-primary/90 hover:shadow-lg">
                    <Download size={16} className="transition-all group-hover:translate-y-[1px]" />
                    <span>Download PDF</span>
                  </Button>
                )}
              </div>
              <PdfPreview
                url={url}
                settings={settings}
                previewUrl={previewUrl}
                isLoading={isLoading}
                metadata={pdfMetadata}
                onMetadataChange={handleMetadataChange}
                onMetadataSave={handleMetadataSave}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
        defaultView="login" 
      />
    </div>
  );
};

export default Index;
