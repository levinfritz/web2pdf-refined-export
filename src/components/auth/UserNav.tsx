import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "./AuthDialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Settings } from "lucide-react";

const UserNav: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogView, setAuthDialogView] = useState<"login" | "signup">("login");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleLogin = () => {
    setAuthDialogView("login");
    setAuthDialogOpen(true);
  };

  const handleSignup = () => {
    setAuthDialogView("signup");
    setAuthDialogOpen(true);
  };

  const handleDeleteAccount = async () => {
    try {
      // Hier würde der tatsächliche API-Aufruf zum Löschen des Accounts kommen
      await supabase.auth.admin.deleteUser(user?.id as string);
      toast.success("Dein Account wurde erfolgreich gelöscht.");
      await logout();
    } catch (error) {
      toast.error("Fehler beim Löschen des Accounts. Bitte versuche es später erneut.");
    }
  };

  if (user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {user.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.displayName || user.email} />
                ) : (
                  <AvatarFallback>{user.displayName?.[0] || user.email[0].toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              disabled={isLoading}
            >
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => logout()}
              disabled={isLoading}
            >
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Account wirklich löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Dein Account und alle damit verbundenen Daten werden permanent gelöscht.
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
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={handleLogin}>
          Anmelden
        </Button>
        <Button onClick={handleSignup}>
          Registrieren
        </Button>
      </div>
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
        defaultView={authDialogView} 
      />
    </>
  );
};

export default UserNav;
