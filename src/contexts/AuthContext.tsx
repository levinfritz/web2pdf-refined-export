
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

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

  // This is a mock implementation for the front-end only
  // In a real app, this would connect to a backend authentication service
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("web2pdf_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - in real app would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user
      const mockUser = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: email.split('@')[0],
      };
      
      localStorage.setItem("web2pdf_user", JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success("Login successful!");
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Mock Google login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: "google_" + Math.random().toString(36).substr(2, 9),
        email: "user@example.com",
        displayName: "Google User",
        photoURL: "https://ui-avatars.com/api/?name=Google+User&background=0D8ABC&color=fff",
      };
      
      localStorage.setItem("web2pdf_user", JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success("Google login successful!");
    } catch (error) {
      toast.error("Google login failed.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGitHub = async () => {
    setIsLoading(true);
    try {
      // Mock GitHub login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: "github_" + Math.random().toString(36).substr(2, 9),
        email: "github@example.com",
        displayName: "GitHub User",
        photoURL: "https://ui-avatars.com/api/?name=GitHub+User&background=333&color=fff",
      };
      
      localStorage.setItem("web2pdf_user", JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success("GitHub login successful!");
    } catch (error) {
      toast.error("GitHub login failed.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: email.split('@')[0],
      };
      
      localStorage.setItem("web2pdf_user", JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Mock logout
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.removeItem("web2pdf_user");
      setUser(null);
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed.");
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
