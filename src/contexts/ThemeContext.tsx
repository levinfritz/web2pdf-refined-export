
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  saving: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
  });
  const [saving, setSaving] = useState(false);

  // Function to set theme with persistence to user settings if logged in
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // Try to save theme to user settings if logged in
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) {
      try {
        setSaving(true);
        // Try to update user metadata with theme preference
        await supabase.auth.updateUser({
          data: { theme_preference: newTheme }
        });
      } catch (error) {
        console.error('Error saving theme to user settings:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  // Get theme from user settings on login
  useEffect(() => {
    const getUserThemePreference = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.user_metadata?.theme_preference) {
        setThemeState(data.user.user_metadata.theme_preference);
        localStorage.setItem('theme', data.user.user_metadata.theme_preference);
      }
    };
    
    getUserThemePreference();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.user_metadata?.theme_preference) {
          setThemeState(session.user.user_metadata.theme_preference);
          localStorage.setItem('theme', session.user.user_metadata.theme_preference);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Apply theme classes to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Add transition class for smooth theme changes
    root.classList.add('transition-colors');
    root.style.transitionDuration = '300ms';
    
    // Remove old classes
    root.classList.remove('light', 'dark');
    
    // Add new class based on theme
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen for system theme changes if using system preference
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, saving }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
