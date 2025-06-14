import React from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PdfSettingsType, PaperSizeType, MarginsType, ThemeType, StylePresetType, CompressionQualityType } from "@/types/pdf-types";

interface PdfSettingsProps {
  settings: PdfSettingsType;
  onSettingsChange: (settings: Partial<PdfSettingsType>) => void;
  disabled?: boolean;
}

const PdfSettings: React.FC<PdfSettingsProps> = ({
  settings,
  onSettingsChange,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="layout" className="space-y-4">
          <div className="space-y-2">
            <Label>Paper Size</Label>
            <RadioGroup
              value={settings.paperSize}
              onValueChange={(value: string) => onSettingsChange({ paperSize: value as PaperSizeType })}
              className="flex flex-wrap gap-2"
              disabled={disabled}
            >
              {["A4", "A5", "Letter", "Legal"].map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <RadioGroupItem value={size} id={`size-${size}`} />
                  <Label htmlFor={`size-${size}`}>{size}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Orientation</Label>
            <RadioGroup
              value={settings.orientation}
              onValueChange={(value) => onSettingsChange({ orientation: value as "portrait" | "landscape" })}
              className="flex gap-4"
              disabled={disabled}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="portrait" id="orientation-portrait" />
                <Label htmlFor="orientation-portrait">Portrait</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="landscape" id="orientation-landscape" />
                <Label htmlFor="orientation-landscape">Landscape</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Margins</Label>
            <Select
              value={settings.margins}
              onValueChange={(value: string) => onSettingsChange({ margins: value as MarginsType })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select margins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-images">Include Images</Label>
            <Switch
              id="include-images"
              checked={settings.includeImages}
              onCheckedChange={(checked) => onSettingsChange({ includeImages: checked })}
              disabled={disabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-links">Interactive Links</Label>
            <Switch
              id="include-links"
              checked={settings.preserveLinks}
              onCheckedChange={(checked) => onSettingsChange({ preserveLinks: checked })}
              disabled={disabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="remove-ads">Remove Ads</Label>
            <Switch
              id="remove-ads"
              checked={settings.removeAds}
              onCheckedChange={(checked) => onSettingsChange({ removeAds: checked })}
              disabled={disabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-subpages">Include Subpages</Label>
            <Switch
              id="include-subpages"
              checked={settings.includeSubpages}
              onCheckedChange={(checked) => onSettingsChange({ includeSubpages: checked })}
              disabled={disabled}
            />
          </div>
          
          {settings.includeSubpages && (
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              <Label htmlFor="max-subpages">Max. Subpages</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="max-subpages"
                  value={[settings.maxSubpages]}
                  min={1}
                  max={30}
                  step={1}
                  onValueChange={([value]) => onSettingsChange({ maxSubpages: value })}
                  disabled={disabled}
                  className="flex-1"
                />
                <div className="w-12 text-center">
                  {settings.maxSubpages}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Die Anzahl der Unterseiten, die in die PDF aufgenommen werden sollen.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Theme</Label>
              <RadioGroup
                value={settings.theme}
                onValueChange={(value: string) => onSettingsChange({ theme: value as ThemeType })}
                className="flex gap-4"
                disabled={disabled}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="theme-auto" />
                  <Label htmlFor="theme-auto">Auto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark">Dark</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Font Size</Label>
              <span className="text-sm">{settings.fontSize}%</span>
            </div>
            <Slider
              value={[settings.fontSize]}
              min={75}
              max={150}
              step={5}
              onValueChange={([value]) => onSettingsChange({ fontSize: value })}
              disabled={disabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Style Preset</Label>
            <Select
              value={settings.stylePreset}
              onValueChange={(value: string) => onSettingsChange({ stylePreset: value as StylePresetType })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="readable">Readable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="advanced-info">Erweiterte Einstellungen</Label>
            <p className="text-sm text-muted-foreground">
              Diese Einstellungen sind für fortgeschrittene Benutzer.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Komprimierungsqualität</Label>
            <Select
              value={settings.compressionLevel || 'ebook'}
              onValueChange={(value: string) => onSettingsChange({ compressionLevel: value as CompressionQualityType })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Komprimierungsqualität wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="screen">Niedrig (kleinste Dateigröße)</SelectItem>
                <SelectItem value="ebook">Mittel (Standard)</SelectItem>
                <SelectItem value="printer">Hoch (bessere Qualität)</SelectItem>
                <SelectItem value="prepress">Sehr hoch (beste Qualität)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Bestimmt die Qualität und Dateigröße des generierten PDFs.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custom-css">CSS-Anpassungen</Label>
            <textarea 
              id="custom-css"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
              placeholder="body { font-family: Arial; }"
              disabled={disabled}
              value={settings.customCss || ''}
              onChange={(e) => onSettingsChange({ customCss: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Benutzerdefinierte CSS-Regeln, die auf die Seite angewendet werden.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PdfSettings;
