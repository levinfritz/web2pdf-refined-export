
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaperSizeType, PdfSettingsType } from "@/types/pdf-types";
import { cn } from "@/lib/utils";

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
        <div 
          className={cn(
            "bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300",
            settings.orientation === "landscape" ? "aspect-[1.4142/1]" : "aspect-[1/1.4142]"
          )}
          style={{ 
            aspectRatio: settings.orientation === "landscape" ? 1.4142 : 1/1.4142,
            transform: `scale(${settings.orientation === "landscape" ? 0.9 : 1})` 
          }}
        >
          {isLoading ? (
            <div className="w-full h-full p-4 flex flex-col gap-3">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-40 w-full mt-2" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
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
              className="w-full h-full border-0" 
              title="PDF Preview"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6">
              <div className="text-center animate-pulse-slow">
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
      </div>
    </div>
  );
};

export default PdfPreview;
