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
import { PdfSettingsType } from "@/types/pdf-types";
import { convertUrlToPdf } from "@/services/pdfService";
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

  const handleUrlSubmit = async (submittedUrl: string, auth?: { username: string; password: string }) => {
    if (!user) {
      setAuthDialogOpen(true);
      toast.info("Bitte melde dich an oder erstelle einen Account, um PDFs zu generieren");
      return;
    }
    
    setUrl(submittedUrl);
    setIsLoading(true);
    try {
      const result = await convertUrlToPdf(submittedUrl, settings, user?.id, auth);
      setPdfUrl(result.pdfUrl);
      setPreviewUrl(result.previewUrl);
      toast.success("PDF erfolgreich erstellt!");
    } catch (error) {
      console.error("Error converting PDF:", error);
      toast.error("Fehler bei der PDF-Erstellung");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (newSettings: Partial<PdfSettingsType>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleDownload = () => {
    if (pdfUrl) {
      // Erstelle einen Link-Element und simuliere einen Klick für direkten Download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `web2pdf_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container max-w-6xl px-4 pb-16">
      <Header />
      
      <main className="py-4 md:py-8">
        <Card className="glass-card conversion-card mb-4 md:mb-8 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <UrlForm onUrlSubmit={handleUrlSubmit} isLoading={isLoading} />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="glass-card md:col-span-1 order-2 md:order-1">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-medium mb-4">PDF Settings</h2>
              <PdfSettings 
                settings={settings} 
                onSettingsChange={handleSettingsChange} 
                disabled={isLoading}
              />
            </CardContent>
          </Card>
          
          <Card className="glass-card md:col-span-2 order-1 md:order-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-lg font-medium mb-2 sm:mb-0">Preview</h2>
                {pdfUrl && (
                  <Button onClick={handleDownload} className="gap-2 w-full sm:w-auto">
                    <Download size={16} />
                    <span>Download PDF</span>
                  </Button>
                )}
              </div>
              <PdfPreview
                url={url}
                settings={settings}
                previewUrl={previewUrl}
                isLoading={isLoading}
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
