import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PdfMetadataResponse, PdfMetadataType } from "@/types/pdf-types";
import { Badge } from "@/components/ui/badge";
import { formatBytes, cn } from "@/lib/utils";
import { Save, Plus, X } from "lucide-react";

interface PdfMetadataEditorProps {
  metadata: PdfMetadataResponse;
  onMetadataChange: (metadata: PdfMetadataType) => void;
  onSave: () => void;
  disabled?: boolean;
}

const PdfMetadataEditor: React.FC<PdfMetadataEditorProps> = ({
  metadata,
  onMetadataChange,
  onSave,
  disabled = false
}) => {
  const [editedMetadata, setEditedMetadata] = useState<PdfMetadataType>({
    title: metadata.title || "",
    author: "",
    subject: "",
    keywords: []
  });
  
  const [keywordsInput, setKeywordsInput] = useState("");
  
  const handleInputChange = (key: keyof PdfMetadataType, value: string) => {
    setEditedMetadata(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleAddKeyword = () => {
    if (keywordsInput.trim()) {
      setEditedMetadata(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordsInput.trim()]
      }));
      setKeywordsInput("");
    }
  };
  
  const handleRemoveKeyword = (index: number) => {
    setEditedMetadata(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };
  
  useEffect(() => {
    onMetadataChange(editedMetadata);
  }, [editedMetadata, onMetadataChange]);
  
  return (
    <Card className="animate-in fade-in duration-300">
      <CardHeader className="animate-in slide-in-from-top duration-300">
        <CardTitle>PDF Metadaten</CardTitle>
        <CardDescription>
          Bearbeiten Sie die Metadaten für Ihr PDF-Dokument
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 animate-in slide-in-from-top duration-300 delay-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="space-y-1 mb-4">
              <Label htmlFor="pdf-title">Titel</Label>
              <Input
                id="pdf-title"
                value={editedMetadata.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="PDF Titel"
                disabled={disabled}
                className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
              />
            </div>
            
            <div className="space-y-1 mb-4">
              <Label htmlFor="pdf-author">Autor</Label>
              <Input
                id="pdf-author"
                value={editedMetadata.author}
                onChange={(e) => handleInputChange("author", e.target.value)}
                placeholder="Autor des Dokuments"
                disabled={disabled}
                className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
              />
            </div>
          </div>
          
          <div>
            <div className="space-y-1 mb-4">
              <Label htmlFor="pdf-subject">Betreff</Label>
              <Input
                id="pdf-subject"
                value={editedMetadata.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Betreff des Dokuments"
                disabled={disabled}
                className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
              />
            </div>
            
            <div className="space-y-1 mb-4">
              <Label htmlFor="pdf-keywords">Schlüsselwörter</Label>
              <div className="flex gap-2">
                <Input
                  id="pdf-keywords"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="Schlüsselwort hinzufügen"
                  disabled={disabled}
                  className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={handleAddKeyword}
                  disabled={disabled || !keywordsInput.trim()}
                  variant="secondary"
                  className="transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  <Plus size={16} className="transition-transform group-hover:scale-110" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {editedMetadata.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {editedMetadata.keywords.map((keyword, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center gap-1 animate-in fade-in zoom-in duration-300"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(index)}
                  className="ml-1 text-xs hover:text-destructive transition-colors duration-200"
                  disabled={disabled}
                >
                  <X size={12} className="transition-transform hover:scale-110" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex flex-col gap-2 mt-4">
          <div className="text-sm">
            <span className="font-medium">Dateigröße:</span> {formatBytes(metadata.fileSize)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Komprimierungsstufe:</span> {metadata.compressionLevel === "screen" ? "Niedrig" : 
              metadata.compressionLevel === "ebook" ? "Mittel" : 
              metadata.compressionLevel === "printer" ? "Hoch" : "Sehr hoch"}
          </div>
          <div className="text-sm">
            <span className="font-medium">Erstellt am:</span> {new Date(metadata.createdAt).toLocaleString()}
          </div>
        </div>
        
        <Button 
          onClick={onSave} 
          disabled={disabled}
          className="w-full mt-4 transition-all duration-300 hover:shadow-lg group"
        >
          <Save size={16} className="mr-2 transition-transform group-hover:translate-y-[-1px]" />
          <span>Metadaten speichern</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PdfMetadataEditor;
