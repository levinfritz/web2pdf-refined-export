import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export type User = {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<any>;
  loginWithGitHub: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Hilfsfunktion zum Extrahieren des Profilbilds aus verschiedenen Provider-Metadaten
function extractProfileImage(metadata: any): string | null {
  if (!metadata) return null;
  
  // Debugging: Ausgabe aller Metadaten-Schlüssel
  console.log('Available metadata keys:', Object.keys(metadata));
  
  // Prüfe verschiedene mögliche Schlüssel für das Profilbild
  // Spezifisch für Google
  if (metadata.provider_id === 'google' || metadata.provider === 'google') {
    // Google-spezifische Profilbild-Extraktion
    console.log('Google provider detected, checking specific fields');
    if (metadata.picture) console.log('Found picture:', metadata.picture);
    if (metadata.avatar_url) console.log('Found avatar_url:', metadata.avatar_url);
    
    // Bei Google kann das Bild auch in einer sub-property stecken
    const googleUserInfo = metadata.user_info || metadata.profile || {};
    if (googleUserInfo.picture) console.log('Found in user_info.picture:', googleUserInfo.picture);
    
    return metadata.picture || 
           metadata.avatar_url || 
           googleUserInfo.picture ||
           metadata.profile_picture ||
           null;
  }
  
  // Allgemeine Extraktion für andere Provider
  return metadata.avatar_url || 
         metadata.picture || 
         metadata.profile_picture || 
         metadata.image || 
         null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Verbesserte Benutzerdaten-Extraktion für OAuth-Provider
          const metadata = session.user.user_metadata || {};
          const providerId = metadata.provider || '';
          
          console.log(`Auth provider: ${providerId}`);
          console.log('User metadata:', metadata);
          
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            // Hole den Anzeigenamen aus den Metadaten oder aus den Provider-Daten
            displayName: 
              metadata.name || 
              metadata.full_name || 
              metadata.user_name ||
              metadata.preferred_username ||
              session.user.email?.split('@')[0] || '',
            // Nutze die Hilfsfunktion für die Profilbild-Extraktion
            photoURL: extractProfileImage(metadata),
          };
          
          setUser(userData);
          
          // Show welcome toast only on sign-in events, not on every auth state change
          if (event === 'SIGNED_IN' && !hasShownWelcome) {
            showWelcomeToast(userData);
            setHasShownWelcome(true);
          }
        } else {
          setUser(null);
          setHasShownWelcome(false);
        }
        setIsLoading(false);
      }
    );

    // Check current session on load
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Verbesserte Benutzerdaten-Extraktion für OAuth-Provider
        const metadata = data.session.user.user_metadata || {};
        const providerId = metadata.provider || '';
        
        console.log(`Auth provider: ${providerId}`);
        console.log('User session metadata:', metadata);
        
        const userData: User = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          // Hole den Anzeigenamen aus den Metadaten oder aus den Provider-Daten
          displayName: 
            metadata.name || 
            metadata.full_name || 
            metadata.user_name ||
            metadata.preferred_username ||
            data.session.user.email?.split('@')[0] || '',
          // Nutze die Hilfsfunktion für die Profilbild-Extraktion
          photoURL: extractProfileImage(metadata),
        };
        
        setUser(userData);
        
        // Show welcome toast on initial load if not shown already
        if (!hasShownWelcome) {
          showWelcomeToast(userData);
          setHasShownWelcome(true);
        }
      }
      setIsLoading(false);
    };
    
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [hasShownWelcome]);

  const showWelcomeToast = (userData: User) => {
    toast.success(`Willkommen, ${userData.displayName || userData.email.split('@')[0]}!`, {
      duration: 3000,
      position: 'top-center',
      className: 'welcome-toast',
      icon: '👋',
      description: 'Schön, dass du wieder da bist!',
      closeButton: true
    });
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Login erfolgreich!");
      return data;
    } catch (error: any) {
      toast.error(`Login fehlgeschlagen: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user && data.user.identities?.length === 0) {
        toast.error("Diese E-Mail-Adresse wird bereits verwendet.");
      } else {
        toast.success("Account erfolgreich erstellt! Bitte überprüfe deine E-Mails für die Bestätigung.");
      }
      
      return data;
    } catch (error: any) {
      toast.error(`Registrierung fehlgeschlagen: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast.success("Erfolgreich abgemeldet!");
    } catch (error: any) {
      toast.error(`Abmeldung fehlgeschlagen: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) throw error;
      
      toast.success("Login mit Google erfolgreich!");
      return data;
    } catch (error: any) {
      toast.error(`Login mit Google fehlgeschlagen: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGitHub = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
      });
      
      if (error) throw error;
      
      toast.success("Login mit GitHub erfolgreich!");
      return data;
    } catch (error: any) {
      toast.error(`Login mit GitHub fehlgeschlagen: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithGitHub,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
