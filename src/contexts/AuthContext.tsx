
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
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            photoURL: session.user.user_metadata?.avatar_url,
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check current session on load
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const userData: User = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          displayName: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || '',
          photoURL: data.session.user.user_metadata?.avatar_url,
        };
        setUser(userData);
      }
      setIsLoading(false);
    };
    
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
      
      // No toast here as we're redirecting to Google
    } catch (error: any) {
      toast.error(`Google Login fehlgeschlagen: ${error.message}`);
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithGitHub = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
      
      // No toast here as we're redirecting to GitHub
    } catch (error: any) {
      toast.error(`GitHub Login fehlgeschlagen: ${error.message}`);
      setIsLoading(false);
      throw error;
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

  const value = {
    user,
    isLoading,
    login,
    loginWithGoogle,
    loginWithGitHub,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
