
import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UrlForm from "@/components/UrlForm";
import PdfSettings from "@/components/PdfSettings";
import PdfPreview from "@/components/PdfPreview";
import { PdfSettingsType } from "@/types/pdf-types";
import { convertUrlToPdf } from "@/services/pdfService";

const Index = () => {
  const [url, setUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  });

  const handleUrlSubmit = async (submittedUrl: string) => {
    setUrl(submittedUrl);
    setIsLoading(true);
    setPdfUrl(null);
    setPreviewUrl(null);
    
    try {
      const response = await convertUrlToPdf(submittedUrl, settings);
      
      if (response.status === "success") {
        setPdfUrl(response.url || null);
        setPreviewUrl(response.previewUrl || null);
        toast.success("PDF generated successfully");
      } else {
        toast.error(response.message || "Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("An error occurred while generating the PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (newSettings: Partial<PdfSettingsType>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // If URL is already submitted, regenerate PDF with new settings
    if (url && !isLoading) {
      handleUrlSubmit(url);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    
    // In a real app, this would trigger a download
    // For this demo, we'll just show a toast
    toast.success("Download started");
    
    // Simulate download by opening in new tab
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container max-w-6xl px-4">
        <Header />
        
        <main className="py-8">
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <UrlForm onUrlSubmit={handleUrlSubmit} isLoading={isLoading} />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card md:col-span-1">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">PDF Settings</h2>
                <PdfSettings 
                  settings={settings} 
                  onSettingsChange={handleSettingsChange} 
                  disabled={isLoading}
                />
              </CardContent>
            </Card>
            
            <Card className="glass-card md:col-span-2">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Preview</h2>
                  {pdfUrl && (
                    <Button onClick={handleDownload} className="gap-2">
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
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
