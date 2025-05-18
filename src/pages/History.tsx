import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  History as HistoryIcon, 
  Download, 
  ExternalLink, 
  Loader2, 
  Trash2, 
  AlertTriangle,
  RefreshCw 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  created_at: string;
  pdf_url: string;
  user_id: string;
}

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      if (!user) {
        setHistoryItems([]);
        return;
      }
      
      // Run cleanup function to remove entries older than 7 days
      try {
        await supabase.rpc('cleanup_old_history');
      } catch (cleanupError) {
        console.error('Error during history cleanup:', cleanupError);
        // Continue with fetching history even if cleanup fails
      }
      
      const { data, error } = await supabase
        .from('pdf_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setHistoryItems(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Fehler beim Laden des Verlaufs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleRegenerate = (url: string) => {
    navigate(`/?url=${encodeURIComponent(url)}`);
  };

  const handleDownload = async (pdfUrl: string, title: string) => {
    try {
      // Erstelle einen Link-Element und simuliere einen Klick für direkten Download
      const link = document.createElement('a');
      link.href = pdfUrl;
      
      // Erstelle sicheren Dateinamen aus dem Titel
      const filename = title
        .replace(/[^a-z0-9äöüß]/gi, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
      
      link.setAttribute('download', `${filename}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Fehler beim Herunterladen der PDF-Datei');
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleClearHistoryClick = () => {
    setClearDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !user) return;
    
    try {
      setIsDeleting(true);
      
      // Call the stored function to delete a single history entry
      const { data, error } = await supabase
        .rpc('delete_history_entry', {
          entry_id: itemToDelete,
          user_uuid: user.id
        });
      
      if (error) {
        console.error('Supabase deletion error:', error);
        throw error;
      }
      
      if (data) {
        // Only update the UI after successful deletion
        setHistoryItems(prev => prev.filter(item => item.id !== itemToDelete));
        toast.success('Eintrag erfolgreich gelöscht');
      } else {
        toast.error('Eintrag konnte nicht gelöscht werden');
      }
    } catch (error) {
      console.error('Error deleting history entry:', error);
      toast.error('Fehler beim Löschen des Eintrags');
      
      // Fallback to direct delete if the RPC fails
      try {
        const { error: directError } = await supabase
          .from('pdf_history')
          .delete()
          .eq('id', itemToDelete)
          .eq('user_id', user.id);
          
        if (!directError) {
          setHistoryItems(prev => prev.filter(item => item.id !== itemToDelete));
          toast.success('Eintrag erfolgreich gelöscht (Fallback)');
        }
      } catch (fbError) {
        console.error('Fallback deletion error:', fbError);
      }
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleClearConfirm = async () => {
    if (!user) return;
    
    try {
      setIsClearing(true);
      
      // Call the stored function to clear all history entries for a user
      const { data, error } = await supabase
        .rpc('clear_user_history', {
          user_uuid: user.id
        });
      
      if (error) {
        console.error('Supabase deletion error:', error);
        throw error;
      }
      
      // data contains the number of deleted entries
      if (data !== null && data >= 0) {
        // Only update the UI after successful deletion
        setHistoryItems([]);
        toast.success(`${data} Einträge erfolgreich gelöscht`);
      } else {
        toast.error('Verlauf konnte nicht gelöscht werden');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Fehler beim Löschen des Verlaufs');
      
      // Fallback to direct delete if the RPC fails
      try {
        const { error: directError } = await supabase
          .from('pdf_history')
          .delete()
          .eq('user_id', user.id);
          
        if (!directError) {
          setHistoryItems([]);
          toast.success('Verlauf erfolgreich gelöscht (Fallback)');
        }
      } catch (fbError) {
        console.error('Fallback deletion error:', fbError);
      }
    } finally {
      setIsClearing(false);
      setClearDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl px-4">
        <Header />
        <main className="py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4">
      <Header />
      
      <main className="py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Konvertierungsverlauf
            </CardTitle>
            {historyItems.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchHistory}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className="mr-1" />
                  Aktualisieren
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleClearHistoryClick}
                  disabled={isLoading || isClearing}
                >
                  <Trash2 size={16} className="mr-1" />
                  Verlauf löschen
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {historyItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Noch keine PDFs erstellt.</p>
                <Button
                  variant="link"
                  onClick={() => navigate('/')}
                  className="mt-2"
                >
                  Erste PDF erstellen
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        {item.url}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerate(item.url)}
                      >
                        Neu erstellen
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(item.pdf_url, item.title)}
                      >
                        <Download size={16} className="mr-2" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t flex justify-between text-xs text-muted-foreground pt-4">
            <div className="flex items-center gap-1">
              <AlertTriangle size={14} />
              Verlaufseinträge werden nach 7 Tagen automatisch gelöscht
            </div>
            <div>
              {historyItems.length} {historyItems.length === 1 ? 'Eintrag' : 'Einträge'}
            </div>
          </CardFooter>
        </Card>
      </main>
      
      {/* Dialog zum Löschen eines Eintrags */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du diesen Eintrag wirklich aus deinem Verlauf löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialog zum Löschen des gesamten Verlaufs */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gesamten Verlauf löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du wirklich deinen gesamten Verlauf löschen?
              Diese Aktion kann nicht rückgängig gemacht werden und alle Einträge werden unwiderruflich entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearConfirm}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? 'Wird gelöscht...' : 'Gesamten Verlauf löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
