import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaperSizeType, PdfSettingsType } from "@/types/pdf-types";
import { cn } from "@/lib/utils";
import { Moon, Sun, Wrench, XIcon, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PdfPreviewProps {
  url: string | null;
  settings: PdfSettingsType;
  previewUrl?: string | null;
  isLoading: boolean;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  url,
  settings,
  previewUrl,
  isLoading,
}) => {
  const [darkPreview, setDarkPreview] = useState(false);
  const [pageBreakVisible, setPageBreakVisible] = useState(false);
  const { theme } = useTheme?.() || { theme: 'light' };
  
  // Calculate aspect ratio based on paper size and orientation
  const getAspectRatio = (): number => {
    const ratios: Record<PaperSizeType, number> = {
      A4: 1 / 1.4142,  // A4 aspect ratio (1:√2)
      A5: 1 / 1.4142,  // A5 has same ratio as A4
      Letter: 8.5 / 11, // US Letter
      Legal: 8.5 / 14,  // US Legal
    };
    
    const baseRatio = ratios[settings.paperSize];
    return settings.orientation === "landscape" ? 1 / baseRatio : baseRatio;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-xl mx-auto">
        {url && !isLoading && (
          <div className="flex justify-end mb-2 gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setDarkPreview(!darkPreview)}
                  >
                    {darkPreview ? <Sun size={14} /> : <Moon size={14} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle dark preview</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setPageBreakVisible(!pageBreakVisible)}
                  >
                    <Wrench size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Page break controls</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      
        <div 
          className={cn(
            "bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300",
            settings.orientation === "landscape" ? "aspect-[1.4142/1]" : "aspect-[1/1.4142]",
            darkPreview && "pdf-preview-dark"
          )}
          style={{ 
            aspectRatio: settings.orientation === "landscape" ? 1.4142 : 1/1.4142,
            transform: `scale(${settings.orientation === "landscape" ? 0.9 : 1})` 
          }}
        >
          {isLoading ? (
            <div className="w-full h-full p-4 flex flex-col gap-3">
              <div className="skeleton h-8 w-3/4 mb-4 rounded-md"></div>
              <div className="skeleton h-4 w-full rounded-md"></div>
              <div className="skeleton h-4 w-5/6 rounded-md"></div>
              <div className="skeleton h-4 w-full rounded-md"></div>
              <div className="skeleton h-40 w-full mt-2 rounded-md"></div>
              <div className="skeleton h-4 w-full mt-2 rounded-md"></div>
              <div className="skeleton h-4 w-5/6 rounded-md"></div>
              <div className="skeleton h-4 w-4/5 rounded-md"></div>
            </div>
          ) : !url ? (
            <div className="w-full h-full flex items-center justify-center p-6">
              <div className="text-center">
                <h3 className="font-medium text-gray-500 mb-1">PDF Preview</h3>
                <p className="text-sm text-gray-400">
                  Enter a URL and click Convert to see a preview
                </p>
              </div>
            </div>
          ) : previewUrl ? (
            <iframe 
              src={previewUrl}
              className={cn(
                "w-full h-full border-0",
                darkPreview && "pdf-preview-iframe-dark"
              )}
              title="PDF Preview"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6">
              <div className="text-center">
                <RotateCw size={36} className="mx-auto mb-4 animate-spin text-gray-400" />
                <h3 className="font-medium text-gray-500 mb-1">Generating Preview</h3>
                <p className="text-sm text-gray-400">
                  This may take a few moments...
                </p>
              </div>
            </div>
          )}
        </div>
        
        {url && !isLoading && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Preview of {settings.paperSize} ({settings.orientation})
          </div>
        )}
        
        {pageBreakVisible && url && !isLoading && (
          <div className="page-break-control mt-4 p-4 bg-card border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Page Break Controls</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="text-xs h-8">
                Add Page Break
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-8">
                Prevent Break
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These controls affect how content flows across pages in the PDF.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfPreview;
