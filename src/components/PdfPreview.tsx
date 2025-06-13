import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaperSizeType, PdfSettingsType, PdfMetadataResponse, PdfMetadataType } from "@/types/pdf-types";
import { cn } from "@/lib/utils";
import { FileText, Moon, Sun, Wrench, XIcon, ChevronRight, ChevronLeft, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PdfMetadataEditor from "@/components/PdfMetadataEditor";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageBreak, PageBreakRule, addPageBreak, preventPageBreak, removePageBreak, addPageBreakRule, removePageBreakRule } from "@/lib/pageBreakUtils";

interface PdfPreviewProps {
  url: string | null;
  settings: PdfSettingsType;
  previewUrl?: string | null;
  isLoading: boolean;
  metadata?: PdfMetadataResponse;
  onMetadataChange?: (metadata: PdfMetadataType) => void;
  onMetadataSave?: () => void;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  url,
  settings,
  previewUrl,
  isLoading,
  metadata,
  onMetadataChange,
  onMetadataSave,
}) => {
  const [darkPreview, setDarkPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'metadata' | 'pageBreak' | null>(null);
  const [lastActivePanel, setLastActivePanel] = useState<'metadata' | 'pageBreak'>('metadata');
  const { theme } = useTheme?.() || { theme: 'light' };
  
  // State für Seitenumbrüche
  const [pageBreaks, setPageBreaks] = useState<PageBreak[]>([]);
  const [pageBreakRules, setPageBreakRules] = useState<PageBreakRule[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectorInput, setSelectorInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [positionType, setPositionType] = useState<'before' | 'after'>('after');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Hilfsfunktionen für das Sidebar-Panel
  const toggleSidebar = (panel: 'metadata' | 'pageBreak' | null) => {
    if (activePanel === panel && sidebarOpen) {
      setSidebarOpen(false);
      setActivePanel(null);
    } else {
      setSidebarOpen(true);
      setActivePanel(panel);
      if (panel) {
        setLastActivePanel(panel);
      }
    }
  };
  
  // Handler für Seitenumbruch hinzufügen
  const handleAddPageBreak = () => {
    if (!selectorInput.trim()) {
      toast.error("Bitte geben Sie einen CSS-Selektor ein");
      return;
    }
    
    try {
      setPageBreaks(addPageBreak(pageBreaks, selectorInput, positionType));
      toast.success(`Seitenumbruch ${positionType === 'before' ? 'vor' : 'nach'} "${selectorInput}" hinzugefügt`);
      setSelectorInput('');
    } catch (error) {
      toast.error("Fehler beim Hinzufügen des Seitenumbruchs");
      console.error(error);
    }
  };
  
  // Handler für Umbruch verhindern
  const handlePreventBreak = () => {
    if (!selectorInput.trim()) {
      toast.error("Bitte geben Sie einen CSS-Selektor ein");
      return;
    }
    
    try {
      setPageBreaks(preventPageBreak(pageBreaks, selectorInput));
      toast.success(`Seitenumbruch für "${selectorInput}" verhindert`);
      setSelectorInput('');
    } catch (error) {
      toast.error("Fehler beim Hinzufügen der Umbruchverhinderung");
      console.error(error);
    }
  };
  
  // Handler für Seitenumbruch-Regeln
  const handlePageBreakRules = () => {
    setShowAdvancedSettings(true);
  };
  
  // Handler für Hinzufügen einer Seitenumbruch-Regel
  const handleAddPageBreakRule = (action: 'add' | 'prevent') => {
    if (!selectorInput.trim() || !conditionInput.trim()) {
      toast.error("Bitte geben Sie einen Selektor und eine Bedingung ein");
      return;
    }
    
    try {
      setPageBreakRules(addPageBreakRule(pageBreakRules, selectorInput, conditionInput, action));
      toast.success(`Seitenumbruch-Regel hinzugefügt`);
      setSelectorInput('');
      setConditionInput('');
      setShowAdvancedSettings(false);
    } catch (error) {
      toast.error("Fehler beim Hinzufügen der Seitenumbruch-Regel");
      console.error(error);
    }
  };
  
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  const controlsVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <motion.div 
      className="w-full flex flex-col items-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dialog für erweiterte Seitenumbruch-Regeln */}
      <Dialog open={showAdvancedSettings} onOpenChange={setShowAdvancedSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erweiterte Seitenumbruch-Regeln</DialogTitle>
            <DialogDescription>
              Definieren Sie Regeln für automatische Seitenumbrüche basierend auf bestimmten Bedingungen.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rule-selector">CSS-Selektor</Label>
              <Input
                id="rule-selector"
                value={selectorInput}
                onChange={(e) => setSelectorInput(e.target.value)}
                placeholder="z.B. h2, .class-name, #id"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rule-condition">Bedingung</Label>
              <Input
                id="rule-condition"
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                placeholder="z.B. height > 500px"
              />
            </div>
            
            <div className="flex justify-between space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => handleAddPageBreakRule('add')}
                className="flex-1"
              >
                Umbruch hinzufügen
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAddPageBreakRule('prevent')}
                className="flex-1"
              >
                Umbruch verhindern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <motion.div 
        className="relative w-full max-w-xl mx-auto"
        variants={itemVariants}
      >
        {url && !isLoading && (
          <motion.div 
            className="flex justify-end mb-2 gap-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 transition-all duration-300 hover:scale-105 hover:shadow-sm" 
                    onClick={() => setDarkPreview(!darkPreview)}
                  >
                    <AnimatePresence mode="wait">
                      {darkPreview ? (
                        <motion.div
                          key="sun"
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 90 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Sun size={14} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="moon"
                          initial={{ opacity: 0, rotate: 90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: -90 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Moon size={14} />
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                    className="h-8 w-8 transition-all duration-300 hover:scale-105 hover:shadow-sm" 
                    onClick={() => toggleSidebar('pageBreak')}
                  >
                    <motion.div
                      whileTap={{ rotate: 45 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className={cn(
                        "transition-colors",
                        activePanel === 'pageBreak' && sidebarOpen ? "text-primary" : ""
                      )}
                    >
                      <Wrench size={14} />
                    </motion.div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Page break controls</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {metadata && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 transition-all duration-300 hover:scale-105 hover:shadow-sm" 
                      onClick={() => toggleSidebar('metadata')}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className={cn(
                          "transition-colors",
                          activePanel === 'metadata' && sidebarOpen ? "text-primary" : ""
                        )}
                      >
                        <FileText size={14} />
                      </motion.div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>PDF Metadaten bearbeiten</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </motion.div>
        )}
      
        <motion.div 
          className={cn(
            "bg-white rounded-lg shadow-xl overflow-hidden",
            "transition-all duration-500 ease-in-out",
            settings.orientation === "landscape" ? "aspect-[1.4142/1]" : "aspect-[1/1.4142]",
            darkPreview && "pdf-preview-dark"
          )}
          style={{ 
            aspectRatio: settings.orientation === "landscape" ? 1.4142 : 1/1.4142,
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ 
            scale: settings.orientation === "landscape" ? 0.9 : 1, 
            opacity: 1 
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.4
          }}
        >
          {isLoading ? (
            <div className="w-full h-full p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 mx-auto animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
                <Skeleton className="h-4 w-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
                <Skeleton className="h-4 w-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
                <Skeleton className="h-4 w-5/6 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
                <div className="py-2"></div>
                <Skeleton className="h-4 w-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
                <Skeleton className="h-4 w-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
                <Skeleton className="h-4 w-4/5 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
                <div className="py-2"></div>
                <Skeleton className="h-32 w-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
                <div className="py-2"></div>
                <Skeleton className="h-4 w-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
                <Skeleton className="h-4 w-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
                <Skeleton className="h-4 w-3/4 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
              </div>
            </div>
          ) : !url ? (
            <motion.div 
              className="w-full h-full flex items-center justify-center p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <h3 className="font-medium text-gray-500 mb-1">PDF Preview</h3>
                <p className="text-sm text-gray-400">
                  Enter a URL and click Convert to see a preview
                </p>
              </div>
            </motion.div>
          ) : previewUrl ? (
            <motion.div 
              className="w-full h-full relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <iframe 
                src={previewUrl}
                className={cn(
                  "w-full h-full border-0",
                  darkPreview ? "pdf-preview-iframe-dark" : ""
                )}
                title="PDF Preview"
                style={{
                  filter: darkPreview ? "invert(1) hue-rotate(180deg)" : "none",
                  transition: "filter 400ms ease-in-out"
                }}
              />
            </motion.div>
          ) : (
            <motion.div 
              className="w-full h-full p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="py-2"></div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {url && !isLoading && (
          <motion.div 
            className="mt-4 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Preview of {settings.paperSize} ({settings.orientation})
          </motion.div>
        )}
        
        {/* Seitliches Panel für Metadaten und Page Break Controls */}
        <AnimatePresence>
          {sidebarOpen && url && !isLoading && (
            <motion.div 
              className="fixed right-0 top-0 h-full bg-card border-l shadow-lg z-10 w-80 overflow-y-auto"
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4 sticky top-0 bg-card border-b z-10 flex justify-between items-center">
                <h3 className="font-medium">
                  {activePanel === 'metadata' ? 'PDF Metadaten' : 'Page Break Controls'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 hover:bg-accent/50"
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <XIcon size={16} />
                  </motion.div>
                </Button>
              </div>
              
              <div className="p-4">
                {activePanel === 'pageBreak' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-muted-foreground mb-4">
                      Diese Steuerelemente beeinflussen, wie der Inhalt über die Seiten im PDF verteilt wird.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="selector-input">CSS-Selektor</Label>
                        <Input
                          id="selector-input"
                          value={selectorInput}
                          onChange={(e) => setSelectorInput(e.target.value)}
                          placeholder="z.B. h2, .class-name, #id"
                          className="mb-2 transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
                        />
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <Label htmlFor="position-before">Position:</Label>
                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              size="sm" 
                              variant={positionType === 'before' ? "default" : "outline"}
                              onClick={() => setPositionType('before')}
                              className="text-xs"
                            >
                              Davor
                            </Button>
                            <Button 
                              type="button" 
                              size="sm" 
                              variant={positionType === 'after' ? "default" : "outline"}
                              onClick={() => setPositionType('after')}
                              className="text-xs"
                            >
                              Danach
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-start text-sm h-9 transition-all hover:bg-accent/50 hover:scale-[1.02] hover:shadow-sm"
                        onClick={handleAddPageBreak}
                      >
                        <Wrench size={14} className="mr-2" />
                        Seitenumbruch hinzufügen
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full justify-start text-sm h-9 transition-all hover:bg-accent/50 hover:scale-[1.02] hover:shadow-sm"
                        onClick={handlePreventBreak}
                      >
                        <Wrench size={14} className="mr-2" />
                        Umbruch verhindern
                      </Button>
                      
                      <div className="pt-4 border-t mt-4">
                        <h4 className="text-sm font-medium mb-2">Erweiterte Einstellungen</h4>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start text-sm h-9 transition-all hover:bg-accent/50 hover:scale-[1.02] hover:shadow-sm"
                          onClick={handlePageBreakRules}
                        >
                          <Settings size={14} className="mr-2" />
                          Seitenumbruch-Regeln
                        </Button>
                      </div>
                      
                      {pageBreaks.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Aktive Seitenumbrüche</h4>
                          <div className="space-y-2">
                            {pageBreaks.map((breakItem) => (
                              <div key={breakItem.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md text-xs">
                                <div>
                                  <span className="font-medium">{breakItem.selector}</span>
                                  <span className="text-muted-foreground ml-2">
                                    {breakItem.type === 'add' 
                                      ? `Umbruch ${breakItem.position === 'before' ? 'davor' : 'danach'}` 
                                      : 'Kein Umbruch'}
                                  </span>
                                </div>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-6 w-6" 
                                  onClick={() => setPageBreaks(removePageBreak(pageBreaks, breakItem.id))}
                                >
                                  <XIcon size={12} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {activePanel === 'metadata' && metadata && onMetadataChange && onMetadataSave && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <PdfMetadataEditor
                      metadata={metadata}
                      onMetadataChange={onMetadataChange}
                      onSave={onMetadataSave}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile Toggle Button für das Panel */}
        <AnimatePresence>
          {url && !isLoading && !sidebarOpen && (
            <motion.div 
              className="fixed bottom-4 right-4 md:hidden z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button 
                size="icon" 
                className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground"
                onClick={() => {
                  setSidebarOpen(true);
                  setActivePanel(lastActivePanel || 'metadata');
                }}
              >
                <motion.div
                  whileHover={{ rotate: 45 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Settings size={20} />
                </motion.div>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PdfPreview;
