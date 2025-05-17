import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [settings, setSettings] = useState({
    darkMode: false,
    language: "de",
  });

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.admin.deleteUser(user?.id as string);
      toast.success("Dein Account wurde erfolgreich gelöscht.");
      await logout();
      navigate("/");
    } catch (error) {
      toast.error("Fehler beim Löschen des Accounts. Bitte versuche es später erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Einstellung gespeichert");
  };

  const handlePasswordReset = async () => {
    try {
      setPasswordResetLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/settings`,
      });
      
      if (error) throw error;
      
      toast.success("E-Mail zum Zurücksetzen des Passworts wurde gesendet.");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Zurücksetzen des Passworts.");
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleEmailChange = async () => {
    try {
      if (!newEmail) {
        toast.error("Bitte gib eine neue E-Mail-Adresse ein.");
        return;
      }
      
      setEmailChangeLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });
      
      if (error) throw error;
      
      toast.success("Bestätigungs-E-Mail zur Änderung deiner E-Mail-Adresse wurde gesendet.");
      setNewEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Ändern der E-Mail-Adresse.");
    } finally {
      setEmailChangeLoading(false);
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
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Verwalte deine persönlichen Informationen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Aktuelle E-Mail</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="max-w-md"
                />
              </div>
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="newEmail">Neue E-Mail-Adresse</Label>
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
                    disabled={emailChangeLoading || !newEmail}
                  >
                    {emailChangeLoading ? "Wird geändert..." : "Ändern"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nach der Änderung erhältst du eine Bestätigungs-E-Mail.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Passwort-Sicherheit */}
          <Card>
            <CardHeader>
              <CardTitle>Passwort & Sicherheit</CardTitle>
              <CardDescription>
                Verwalte dein Passwort und die Sicherheitseinstellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={handlePasswordReset}
                disabled={passwordResetLoading}
              >
                {passwordResetLoading ? "E-Mail wird gesendet..." : "Passwort zurücksetzen"}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Du erhältst eine E-Mail mit einem Link zum Zurücksetzen deines Passworts.
              </p>
            </CardContent>
          </Card>

          {/* Darstellung */}
          <Card>
            <CardHeader>
              <CardTitle>Darstellung</CardTitle>
              <CardDescription>
                Passe das Erscheinungsbild der Anwendung an
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Aktiviere den dunklen Modus für die Anwendung
                  </p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) =>
                    handleSettingChange("darkMode", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Gefahrenzone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Gefahrenzone</CardTitle>
              <CardDescription>
                Irreversible Aktionen für deinen Account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isLoading}
              >
                Account löschen
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Dein Account und
              alle damit verbundenen Daten werden permanent gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Account löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings; 