import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { PaperSizeType } from "@/types/pdf-types";
import { useTheme } from "@/contexts/ThemeContext";

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation(); // Hook für Übersetzungen
  const { accentColor, setAccentColor, theme, setTheme } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [displayNameLoading, setDisplayNameLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Verknüpfte Konten Status - Nur ein Konto kann verknüpft sein
  const [linkedAccount, setLinkedAccount] = useState<string | null>(null);
  const [accountLinking, setAccountLinking] = useState(false);
  const [useSocialProfilePic, setUseSocialProfilePic] = useState(true);

  // App-Einstellungen - Standardsprache ist Englisch
  const [settings, setSettings] = useState({
    darkMode: false,
    language: "en", // Standardmäßig Englisch
    accentColor: "blue" // Nur 3 Farben: blue, green, purple
  });

  // PDF-Voreinstellungen
  const [pdfSettings, setPdfSettings] = useState({
    paperSize: "A4" as PaperSizeType,
    orientation: "portrait",
    removeAds: true,
    preserveLinks: true,
    fontSize: 100,
    margins: "normal"
  });

  // Datenschutz-Einstellungen mit erweiterten Cookie-Optionen
  const [privacySettings, setPrivacySettings] = useState({
    shareUsageData: true,
    cookieSettings: {
      necessary: true, // Immer aktiviert
      preferences: true,
      statistics: true,
      marketing: false
    },
    dataRetention: "30days" // Optionen: "30days", "90days", "1year", "forever"
  });

  // Debounce Funktionalität für API-Aufrufe
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdateUser = (data: any) => {
    // Löschen Sie alle vorherigen ausstehenden Aufrufe
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    // Setzen Sie einen neuen Timeout für den Aufruf (500ms Verzögerung)
    updateTimeout.current = setTimeout(async () => {
      try {
        console.log('Debounced updateUser with data:', data);
        await supabase.auth.updateUser({ data });
        toast.success(t("common.success"));
      } catch (error) {
        console.error('Error in debounced updateUser:', error);
        toast.error(t("common.error"));
      }
    }, 500);
  };

  // E-Mail-Validierungsfunktion
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Initialisiere Einstellungen aus lokalem Speicher oder Datenbank
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);

        // Benutzereinstellungen aus Supabase laden
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
          navigate("/login");
          return;
        }

        console.log("User data:", currentUser);

        // Prüfen, ob der Benutzer verknüpfte Konten hat
        const checkLinkedAccounts = async () => {
          if (user) {
            try {
              const { data } = await supabase.auth.getUser();
              const identities = data?.user?.identities || [];
              
              const hasGithub = identities.some(identity => identity.provider === 'github');
              const hasGoogle = identities.some(identity => identity.provider === 'google');
              
              if (hasGithub) {
                setLinkedAccount('github');
              } else if (hasGoogle) {
                setLinkedAccount('google');
              } else {
                setLinkedAccount(null);
              }
            } catch (error) {
              console.error("Fehler beim Abrufen der verknüpften Konten:", error);
              setLinkedAccount(null);
            }
          }
        };
        
        checkLinkedAccounts();

        // Benutzereinstellungen aus den Metadaten laden
        if (currentUser.user_metadata) {
          const metadata = currentUser.user_metadata;

          // Sprache laden
          if (metadata.language) {
            setSettings(prev => ({ ...prev, language: metadata.language }));
            // Sprache sofort anwenden
            i18n.changeLanguage(metadata.language);
          }

          // Akzentfarbe laden
          if (metadata.accentColor) {
            setSettings(prev => ({ ...prev, accentColor: metadata.accentColor }));
            setAccentColor(metadata.accentColor);
          }

          // Dark Mode laden
          if (metadata.darkMode !== undefined) {
            setSettings(prev => ({ ...prev, darkMode: metadata.darkMode }));
          }

          // Social Profile Picture Einstellung laden
          if (metadata.useSocialProfilePic !== undefined) {
            setUseSocialProfilePic(metadata.useSocialProfilePic);
          }

          // PDF-Einstellungen laden
          if (metadata.pdfSettings) {
            setPdfSettings(prev => ({
              ...prev,
              ...metadata.pdfSettings
            }));
          }

          // Datenschutz-Einstellungen laden
          if (metadata.privacySettings) {
            setPrivacySettings(prev => ({
              ...prev,
              ...metadata.privacySettings,
              // Stelle sicher, dass die Cookie-Einstellungen richtig geladen werden
              cookieSettings: {
                ...prev.cookieSettings,
                ...(metadata.privacySettings.cookieSettings || {})
              }
            }));
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error(t("settings.loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  // Füge einen separaten Effect hinzu, um die Synchronisierung der UI zu verbessern
  useEffect(() => {
    // Lade globales CSS für Animationen
    const style = document.createElement('style');
    style.textContent = `
      /* Sanfte Übergänge für Theme-Wechsel */
      body {
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      
      .card {
        transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
      }
      
      .theme-transition {
        transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
      }
      
      .theme-transition * {
        transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
      }
      
      /* Sanfte Animation für Farbwechsel */
      .color-transition {
        transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      
      .color-transition * {
        transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
      }
      
      /* Sanfte Animation für Buttons */
      button {
        transition: transform 0.1s ease, opacity 0.2s ease, background-color 0.2s ease;
      }
      
      button:active:not(:disabled) {
        transform: scale(0.98);
      }
      
      /* Verbesserte Übergänge für Akzentfarben */
      :root {
        transition: --primary 0.3s ease, --primary-foreground 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Stelle sicher, dass die UI-Anzeige mit dem ThemeContext übereinstimmt
    setSettings(prev => ({
      ...prev,
      accentColor: accentColor
    }));
  }, [accentColor]);

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.admin.deleteUser(user?.id as string);
      toast.success(t("common.success"));
      await logout();
      navigate("/");
    } catch (error) {
      toast.error(t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (key: string, value: any) => {
    // Keine Änderung, wenn der Wert gleich bleibt
    if (settings[key] === value) {
      console.log(`Setting ${key} already has value ${value}`);
      return;
    }

    // Aktualisiere zuerst den lokalen State
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    // Wenn die Sprache geändert wurde, wechsle die Sprache direkt
    if (key === "language") {
      i18n.changeLanguage(value);
    }

    // Wenn die Akzentfarbe geändert wurde, setze sie im ThemeContext
    if (key === "accentColor") {
      // Füge eine sanfte Übergangsanimation für Akzentfarbe hinzu
      document.documentElement.classList.add('color-transition');
      setAccentColor(value);
      
      // Zeige Lade-Indikator für Akzentfarbe
      toast.success(
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("settings.appearance.updatingTheme") || "Theme wird aktualisiert..."}
        </div>,
        { duration: 1000 }
      );
      
      // Entferne die Übergangsklasse nach der Animation
      setTimeout(() => {
        document.documentElement.classList.remove('color-transition');
      }, 1000);
      
      return;
    }

    try {
      // Lade aktuelle Metadaten, um nur die geänderten Werte zu aktualisieren
      const { data: userData } = await supabase.auth.getUser();
      const currentMetadata = userData?.user?.user_metadata || {};

      // Sonderbehandlung für Farbthemen und Dark Mode
      let metadata: Record<string, any> = {
        app_settings: {
          ...currentMetadata.app_settings,
          [key]: value
        }
      };

      // Speichere die Farbeinstellung und den Dark Mode als separate Strings (nicht als Objekt)
      if (key === 'darkMode') {
        // Füge eine sanfte Übergangsanimation hinzu
        document.documentElement.classList.add('theme-transition');
        
        // Setze das Theme entsprechend des Dark Mode Wertes
        setTheme(value ? 'dark' : 'light');
        
        // Entferne die Übergangsklasse nach der Animation
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 1000);
      }

      // Verwende den debounced Update statt eines direkten Aufrufs
      debouncedUpdateUser(metadata);
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellung:", error);
      toast.error(t("common.error"));
    }
  };

  const setPdfSetting = async (key: string, value: any) => {
    const updatedPdfSettings = { ...pdfSettings, [key]: value };
    setPdfSettings(updatedPdfSettings);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          pdf_settings: updatedPdfSettings
        }
      });

      if (error) {
        console.error("Supabase Fehler:", error);
        throw error;
      }
      toast.success(t("common.success"));
    } catch (error) {
      console.error("Fehler beim Speichern der PDF-Einstellung:", error);
      toast.error(t("common.error"));
    }
  };

  const setPrivacySetting = async (key: string, value: any) => {
    const updatedPrivacySettings = { ...privacySettings, [key]: value };
    setPrivacySettings(updatedPrivacySettings);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          privacy_settings: updatedPrivacySettings
        }
      });

      if (error) {
        console.error("Supabase Fehler:", error);
        throw error;
      }
      toast.success(t("common.success"));
    } catch (error) {
      console.error("Fehler beim Speichern der Datenschutz-Einstellung:", error);
      toast.error(t("common.error"));
    }
  };

  const handlePasswordReset = async () => {
    try {
      setPasswordResetLoading(true);
      
      // Zeige einen Toast mit Ladeanimation an
      toast.loading(
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("settings.security.sendingResetLink") || "E-Mail wird gesendet..."}
        </div>,
        { id: "password-reset-toast", duration: 3000 }
      );
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/settings`,
      });

      if (error) throw error;

      // Erfolgreiche Rückmeldung mit längerer Anzeigedauer
      toast.success(
        t("settings.security.resetLinkSent") || "E-Mail zum Zurücksetzen des Passworts wurde gesendet", 
        { id: "password-reset-toast", duration: 5000 }
      );
    } catch (error) {
      console.error(error);
      toast.error(
        t("settings.security.resetError") || "Fehler beim Zurücksetzen des Passworts", 
        { id: "password-reset-toast", duration: 5000 }
      );
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !isValidEmail(newEmail)) return;
    try {
      setEmailChangeLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      toast.success(t("settings.profile.emailChangeSuccess"));
      setNewEmail("");
    } catch (error) {
      console.error(error);
      toast.error(t("common.error"));
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleDisplayNameChange = async () => {
    try {
      setDisplayNameLoading(true);

      // Verwende den debounced Update
      debouncedUpdateUser({ 
        name: displayName 
      });

      // Nicht sofort den Erfolg melden, da der Update debounced ist
      // Die Erfolgsmeldung kommt aus der debouncedUpdateUser Funktion
    } catch (error) {
      console.error(error);
      toast.error(t("common.error"));
    } finally {
      setDisplayNameLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Prüfe Dateigröße (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("settings.profile.maxFileSizeError"));
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    try {
      setImageLoading(true);
      
      // Validiere Bildgröße und Format
      if (imageFile.size > 5 * 1024 * 1024) { // 5MB Limit
        throw new Error("Bild ist zu groß. Maximale Größe: 5MB");
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(imageFile.type)) {
        throw new Error("Ungültiges Bildformat. Erlaubt sind: JPG, PNG, GIF, WEBP");
      }

      // Lade Bild in Supabase Storage hoch
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Lösche vorhandenes Profilbild, wenn vorhanden (optional)
      try {
        const { data: existingFiles } = await supabase.storage
          .from('avatars')
          .list('', { 
            search: `${user.id}-` // Suche nach Dateien mit Benutzer-ID-Präfix
          });
          
        if (existingFiles && existingFiles.length > 0) {
          await supabase.storage
            .from('avatars')
            .remove(existingFiles.map(file => file.name));
        }
      } catch (listError) {
        console.warn("Konnte vorhandene Dateien nicht auflisten:", listError);
        // Nicht kritisch, Upload trotzdem fortsetzen
      }

      // Neues Bild hochladen
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: true // Überschreibe, falls Datei existiert
        });

      if (uploadError) {
        console.error("Upload-Fehler:", uploadError);
        throw new Error(`Fehler beim Hochladen: ${uploadError.message}`);
      }
      
      if (!uploadData || !uploadData.path) {
        throw new Error("Keine Daten vom Upload erhalten");
      }

      // Hole öffentliche URL
      const { data: urlData } = await supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      if (!urlData || !urlData.publicUrl) {
        throw new Error("Konnte keine öffentliche URL für das Bild erhalten");
      }

      // Aktualisiere Benutzer-Metadaten
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: urlData.publicUrl,
          avatar_updated_at: new Date().toISOString()
        }
      });

      if (updateError) {
        console.error("Update-Fehler:", updateError);
        throw new Error(`Fehler beim Aktualisieren des Profils: ${updateError.message}`);
      }

      // Erfolgreiche Rückmeldung
      toast.success(t("settings.profile.avatarUpdated") || "Profilbild erfolgreich aktualisiert");
      
      // Aktualisiere lokalen State
      setImageFile(null);
      setImagePreview(null);
      
      // Aktualisiere den Benutzer im State durch erneutes Laden
      // Dies löst den Auth-State-Listener aus, der den User-State aktualisiert
      const { data: userData } = await supabase.auth.getUser();
      
      // Erzwinge einen Reload der Seite, um sicherzustellen, dass alle Komponenten
      // das neue Profilbild anzeigen
      window.location.reload();
    } catch (error) {
      console.error("Profilbild-Upload-Fehler:", error);
      toast.error(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setImageLoading(false);
    }
  };
  
  const startAccountLinking = (provider: 'google' | 'github') => {
    setAccountLinking(true);
    try {
      // Verknüpfen mit dem ausgewählten Provider und Profilbild übernehmen
      supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/settings`,
          queryParams: {
            // Zusätzliche Parameter für Zugriff auf Profilbild
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      // Einstellung speichern, dass Social Profile Bilder verwendet werden sollen
      if (useSocialProfilePic) {
        debouncedUpdateUser({ useSocialProfilePic: true });
      }
    } catch (error) {
      console.error(error);
      toast.error(t("settings.dangerZone.linkError"));
      setAccountLinking(false);
    }
  };
  
  const unlinkAccount = async () => {
    toast.error(t("settings.dangerZone.unlinkError"));
    // In einer realen Implementierung würde hier eine API zum Entfernen der Verknüpfung aufgerufen werden
  };
  
  const handleDataExport = async () => {
    try {
      setExportLoading(true);
      
      // In einer realen Anwendung würde hier ein API-Aufruf gemacht werden,
      // um alle Benutzerdaten zu exportieren
      const userData = {
        profile: {
          id: user?.id,
          email: user?.email,
          displayName: user?.displayName
        },
        settings: settings,
        pdfSettings: pdfSettings,
        privacySettings: privacySettings
      };
      
      // Daten als JSON-Datei herunterladen
      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `web2pdf-data-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success(t("common.success"));
    } catch (error) {
      console.error(error);
      toast.error(t("common.error"));
    } finally {
      setExportLoading(false);
    }
  };

  const setCookieSetting = async (key: string, value: boolean) => {
    try {
      const updatedCookieSettings = {
        ...privacySettings.cookieSettings,
        [key]: value
      };
      
      const updatedPrivacySettings = {
        ...privacySettings,
        cookieSettings: updatedCookieSettings
      };
      
      setPrivacySettings(updatedPrivacySettings);
      
      // Aktualisiere in der Datenbank
      const { data: userData } = await supabase.auth.getUser();
      const currentMetadata = userData?.user?.user_metadata || {};
      await supabase.auth.updateUser({
        data: {
          privacy_settings: {
            ...currentMetadata.privacy_settings,
            cookieSettings: updatedCookieSettings
          }
        }
      });
      
      toast.success(
        <div className="flex flex-col">
          <span>{t("settings.privacy.cookieUpdateSuccess")}</span>
          <button 
            className="text-sm underline mt-1 text-left" 
            onClick={() => window.location.reload()}
          >
            {t("settings.privacy.reloadPage") || "Seite neu laden für vollständige Wirkung"}
          </button>
        </div>,
        { duration: 5000 }
      );
    } catch (error) {
      console.error(error);
      toast.error(t("common.error"));
    }
  };

  const setDataRetention = async (value: string) => {
    const updatedPrivacySettings = {
      ...privacySettings,
      dataRetention: value
    };
    
    setPrivacySettings(updatedPrivacySettings);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          privacy_settings: updatedPrivacySettings
        }
      });
      
      if (error) {
        console.error("Supabase Fehler:", error);
        throw error;
      }
      toast.success(t("common.success"));
    } catch (error) {
      console.error("Fehler beim Speichern der Datenspeicherungs-Einstellung:", error);
      toast.error(t("common.error"));
    }
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="container max-w-4xl px-4">
      <Header />
      
      <main className="py-8">
        <div className="space-y-6">
          {/* Profil-Einstellungen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-left">{t("settings.profile.title")}</CardTitle>
              <CardDescription className="text-left">
                {t("settings.profile.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profilbild */}
              <div className="space-y-2 text-left">
                <Label>{t("settings.profile.profilePicture")}</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {user.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={user.displayName || user.email} />
                    ) : (
                      <AvatarFallback>{user.displayName?.[0] || user.email[0].toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <Input id="profileImage" type="file" accept="image/*" onChange={handleImageChange} />
                    <p className="text-xs text-muted-foreground">
                      {t("settings.profile.maxFileSize")}
                    </p>
                    {imagePreview && (
                      <div className="mt-2 mb-4">
                        <p className="text-sm mb-2">Vorschau</p>
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                          <img src={imagePreview} alt="Vorschau" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                    {imageFile && (
                      <Button 
                        onClick={handleImageUpload} 
                        disabled={imageLoading} 
                        size="sm"
                      >
                        {imageLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("common.uploading")}
                          </>
                        ) : t("common.upload")}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Social Profile Pictures */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">{t("settings.profile.useSocialProfilePicture")}</p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => startAccountLinking('github')}
                      disabled={accountLinking}
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => startAccountLinking('google')}
                      disabled={accountLinking}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 9.44L13.17 11.5L11 13.56V9.44ZM8.81 8.81L15.19 15.19L16.19 14.19L9.81 7.81L8.81 8.81Z" />
                      </svg>
                      Google
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Anzeigename */}
              <div className="space-y-2 pt-4 text-left">
                <Label htmlFor="displayName">{t("settings.profile.displayName")}</Label>
                <div className="flex gap-2 max-w-md">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t("settings.profile.displayName")}
                  />
                  <Button 
                    onClick={handleDisplayNameChange} 
                    disabled={displayNameLoading}
                  >
                    {displayNameLoading ? t("common.saving") : t("common.save")}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t("settings.profile.currentEmail")}</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="max-w-md"
                />
              </div>
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="newEmail">{t("settings.profile.newEmail")}</Label>
                <div className="flex gap-2 max-w-md">
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="neue@email.de"
                  />
                  <Button 
                    onClick={handleEmailChange}
                    disabled={emailChangeLoading || !newEmail || !isValidEmail(newEmail)}
                  >
                    {emailChangeLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.saving")}
                      </>
                    ) : t("common.save")}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("settings.profile.emailNote")}
                </p>
                {newEmail && !isValidEmail(newEmail) && (
                  <p className="text-sm text-red-500 mt-1">
                    {t("settings.profile.invalidEmail") || "Bitte gib eine gültige E-Mail-Adresse ein."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sicherheit */}
          <Card>
            <CardHeader>
              <CardTitle>Passwort & Sicherheit</CardTitle>
              <CardDescription>
                Verwalte dein Passwort und die Sicherheitseinstellungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Passwort-Einstellungen</h3>
                <p className="text-sm text-muted-foreground">
                  Du erhältst eine E-Mail mit einem Link zum Zurücksetzen deines Passworts.
                </p>
                <Button 
                  onClick={handlePasswordReset}
                  disabled={passwordResetLoading}
                  className="mt-2"
                >
                  {passwordResetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sende Link...
                    </>
                  ) : (
                    "Passwort zurücksetzen"
                  )}
                </Button>
              </div>

              <div className="space-y-2 pt-4">
                <h3 className="text-sm font-medium">Sitzungsinformationen</h3>
                <div className="rounded-md bg-muted p-4">
                  <div className="text-sm">
                    <p><strong>Letzte Anmeldung:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Browser:</strong> {navigator.userAgent.split("/")[0]}</p>
                    <p><strong>IP-Adresse:</strong> <span className="text-muted-foreground">Aus Datenschutzgründen ausgeblendet</span></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PDF-Voreinstellungen */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.pdfSettings.title")}</CardTitle>
              <CardDescription>
                {t("settings.pdfSettings.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.pdfSettings.paperFormat")}</Label>
                <Select value={pdfSettings.paperSize} onValueChange={(value) => setPdfSetting("paperSize", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("settings.pdfSettings.paperFormat")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A5">A5</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t("settings.pdfSettings.orientation")}</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="portrait" 
                      checked={pdfSettings.orientation === "portrait"} 
                      onChange={() => setPdfSetting("orientation", "portrait")}
                      className="rounded-full"
                    />
                    <Label htmlFor="portrait">{t("settings.pdfSettings.portrait")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="landscape" 
                      checked={pdfSettings.orientation === "landscape"} 
                      onChange={() => setPdfSetting("orientation", "landscape")}
                      className="rounded-full"
                    />
                    <Label htmlFor="landscape">{t("settings.pdfSettings.landscape")}</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Ränder</Label>
                <Select value={pdfSettings.margins} onValueChange={(value) => setPdfSetting("margins", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Wähle Randgröße" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine</SelectItem>
                    <SelectItem value="small">Klein</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="large">Groß</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="remove-ads">Werbung entfernen</Label>
                  <p className="text-sm text-muted-foreground">
                    Standardmäßig Werbung aus PDF entfernen
                  </p>
                </div>
                <Switch
                  id="remove-ads"
                  checked={pdfSettings.removeAds}
                  onCheckedChange={(checked) => setPdfSetting("removeAds", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="preserve-links">Interaktive Links</Label>
                  <p className="text-sm text-muted-foreground">
                    Links im PDF klickbar machen
                  </p>
                </div>
                <Switch
                  id="preserve-links"
                  checked={pdfSettings.preserveLinks}
                  onCheckedChange={(checked) => setPdfSetting("preserveLinks", checked)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Schriftgröße</Label>
                  <span className="text-sm">{pdfSettings.fontSize}%</span>
                </div>
                <input
                  type="range"
                  min={75}
                  max={150}
                  step={5}
                  value={pdfSettings.fontSize}
                  onChange={(e) => setPdfSetting("fontSize", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>


          
          {/* Verknüpfte Konten */}
          <Card>
            <CardHeader>
              <CardTitle>Verknüpfte Konten</CardTitle>
              <CardDescription>
                Verknüpfe deinen Account mit einem anderen Dienst für einfaches Login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkedAccount ? (
                // Zeige nur das verknüpfte Konto an
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {linkedAccount === 'google' ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    ) : (
                      <Github className="h-5 w-5" />
                    )}
                    <div>
                      <div className="font-medium">{linkedAccount === 'google' ? 'Google' : 'GitHub'}</div>
                      <div className="text-sm text-muted-foreground">
                        Verknüpft
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={unlinkAccount} 
                  >
                    Trennen
                  </Button>
                </div>
              ) : (
                // Zeige Optionen zum Verknüpfen an, wenn kein Konto verknüpft ist
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Du hast noch kein Konto verknüpft. Wähle einen Dienst zur Verknüpfung:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => startAccountLinking('google')} 
                      disabled={accountLinking}
                      className="flex items-center justify-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Mit Google verknüpfen
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => startAccountLinking('github')} 
                      disabled={accountLinking}
                      className="flex items-center justify-center gap-2"
                    >
                      <Github className="h-5 w-5" />
                      Mit GitHub verknüpfen
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Datenschutz & Daten mit erweiterten Cookie-Einstellungen */}
          <Card>
            <CardHeader>
              <CardTitle>Datenschutz & Daten</CardTitle>
              <CardDescription>
                Verwalte deine Daten und Datenschutzeinstellungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Cookie-Einstellungen</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notwendige Cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Unbedingt erforderlich für die Funktionalität der Website
                    </p>
                  </div>
                  <Switch 
                    checked={true}
                    disabled={true}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Präferenz-Cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Speichern deine Einstellungen und Vorlieben
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.cookieSettings.preferences} 
                    onCheckedChange={(checked) => setCookieSetting("preferences", checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Statistik-Cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Helfen uns zu verstehen, wie Besucher mit der Website interagieren
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.cookieSettings.statistics} 
                    onCheckedChange={(checked) => setCookieSetting("statistics", checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing-Cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Werden verwendet, um personalisierte Werbung anzuzeigen
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.cookieSettings.marketing} 
                    onCheckedChange={(checked) => setCookieSetting("marketing", checked)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-medium">Datenspeicherung</h3>
                <div className="space-y-1">
                  <Label>Wie lange sollen deine Daten gespeichert werden?</Label>
                  <Select 
                    value={privacySettings.dataRetention} 
                    onValueChange={(value) => setDataRetention(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Datenspeicherungsdauer wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">30 Tage</SelectItem>
                      <SelectItem value="90days">90 Tage</SelectItem>
                      <SelectItem value="1year">1 Jahr</SelectItem>
                      <SelectItem value="forever">Unbegrenzt</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nach Ablauf dieser Zeit werden deine gespeicherten PDFs und der Verlauf gelöscht.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nutzungsstatistiken</Label>
                    <p className="text-sm text-muted-foreground">
                      Anonyme Nutzungsdaten zur Verbesserung des Dienstes teilen
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.shareUsageData} 
                    onCheckedChange={(checked) => setPrivacySetting("shareUsageData", checked)} 
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleDataExport} 
                  disabled={exportLoading}
                >
                  {exportLoading ? "Wird exportiert..." : "Meine Daten exportieren"}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Exportiere alle deine Daten, einschließlich PDF-Verlauf und Einstellungen.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Darstellung mit nur 3 Farben */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.appearance.title")}</CardTitle>
              <CardDescription>
                {t("settings.appearance.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.appearance.darkMode")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.appearance.darkModeDesc")}
                  </p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) =>
                    handleSettingChange("darkMode", checked)
                  }
                />
              </div>
              
              <div className="space-y-2 pt-2">
                <Label>{t("settings.appearance.language")}</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("settings.appearance.language")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("settings.appearance.languageNote")}
                </p>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label>{t("settings.appearance.accentColor")}</Label>
                <div className="flex gap-4">
                  {[
                    { name: "default", color: "#cbd5e1", label: t("settings.appearance.default") },
                    { name: "blue", color: "#0284c7", label: t("settings.appearance.blue") },
                    { name: "green", color: "#16a34a", label: t("settings.appearance.green") },
                    { name: "purple", color: "#9333ea", label: t("settings.appearance.purple") }
                  ].map(color => (
                    <div key={color.name} className="flex flex-col items-center gap-2">
                      <button
                        className={`w-10 h-10 rounded-full ${
                          accentColor === color.name ? "ring-2 ring-offset-2 ring-primary" : ""
                        } relative flex items-center justify-center transition-all duration-300`}
                        style={{ backgroundColor: color.color }}
                        onClick={() => handleSettingChange("accentColor", color.name)}
                        aria-label={`Akzentfarbe ${color.label}`}
                      >
                        {color.name === "default" && (
                          <svg className="absolute w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <span className="text-xs">{color.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("settings.appearance.accentColorDesc")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gefahrenzone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">{t("settings.dangerZone.title")}</CardTitle>
              <CardDescription>
                {t("settings.dangerZone.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isLoading}
              >
                {t("settings.dangerZone.deleteAccount")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.dangerZone.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.dangerZone.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings; 