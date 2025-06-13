import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PdfMetadataResponse, PdfMetadataType } from "@/types/pdf-types";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";

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
    <Card>
      <CardHeader>
        <CardTitle>PDF Metadaten</CardTitle>
        <CardDescription>
          Bearbeiten Sie die Metadaten für Ihr PDF-Dokument
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {editedMetadata.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {editedMetadata.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(index)}
                  className="ml-1 text-xs hover:text-destructive"
                  disabled={disabled}
                >
                  ✕
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
          className="w-full mt-4"
        >
          Metadaten speichern
        </Button>
      </CardContent>
    </Card>
  );
};

export default PdfMetadataEditor;
