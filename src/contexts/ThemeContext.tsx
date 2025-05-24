import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

type Theme = 'light' | 'dark' | 'system';
type AccentColor = 'default' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  saving: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Funktion, um sicherzustellen, dass ein Wert ein gültiger Theme-Wert ist
function isValidTheme(value: any): value is Theme {
  return typeof value === 'string' && ['light', 'dark', 'system'].includes(value);
}

// Funktion, um sicherzustellen, dass ein Wert eine gültige Akzentfarbe ist
function isValidAccentColor(value: any): value is AccentColor {
  return typeof value === 'string' && ['default', 'blue', 'green', 'purple'].includes(value);
}

// Funktion zum Forcieren einer Aktualisierung aller CSS-Variablen
const forceStyleUpdate = () => {
  // Kleiner Hack, um einen Style-Recalculation zu erzwingen
  document.body.style.display = 'none';
  // Dies wird von der Browser-Engine optimiert und der User sieht keinen Flicker
  setTimeout(() => {
    document.body.style.display = '';
  }, 5);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    return isValidTheme(savedTheme) ? savedTheme : 'system';
  });
  
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    // Try to get the accent color from localStorage
    const savedColor = localStorage.getItem('accentColor') as AccentColor;
    return isValidAccentColor(savedColor) ? savedColor : 'default';
  });
  
  const [saving, setSaving] = useState(false);

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
      } catch (error) {
        console.error('Error in debounced updateUser:', error);
      }
    }, 500);
  };
  
  // Function to set theme with persistence to user settings if logged in
  const setTheme = async (newTheme: Theme) => {
    // Keine Aktion, wenn der Wert unverändert ist
    if (newTheme === theme) {
      console.log('Theme already set to:', newTheme);
      return;
    }
    
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // Try to save theme to user settings if logged in
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) {
      try {
        setSaving(true);
        
        // Verwende den debounced Update statt eines direkten Aufrufs
        debouncedUpdateUser({ theme_preference: newTheme });
        
        console.log('Queued theme update to user settings:', newTheme);
      } catch (error) {
        console.error('Error saving theme to user settings:', error);
      } finally {
        setSaving(false);
      }
    }
  };
  
  // Function to set accent color with persistence to user settings if logged in
  const setAccentColor = async (newColor: AccentColor) => {
    // Keine Aktion, wenn der Wert unverändert ist
    if (newColor === accentColor) {
      console.log('Accent color already set to:', newColor);
      return;
    }
    
    console.log('Setting accent color to:', newColor);
    setAccentColorState(newColor);
    localStorage.setItem('accentColor', newColor);
    
    // Apply accent color class to document
    applyAccentColor(newColor);
    
    // Try to save accent color to user settings if logged in
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) {
      try {
        setSaving(true);
        
        // Get current user metadata to avoid overwriting other settings
        const { data: userData } = await supabase.auth.getUser();
        const currentMetadata = userData?.user?.user_metadata || {};
        const currentAppSettings = currentMetadata.app_settings || {};
        
        // Prepare update data - only update what we need
        const updateData = {
          accent_color_preference: newColor,
          app_settings: {
            ...currentAppSettings,
            accentColor: newColor
          }
        };
        
        // Verwende den debounced Update statt eines direkten Aufrufs
        debouncedUpdateUser(updateData);
        
        console.log('Queued accent color update to user settings:', newColor);
      } catch (error) {
        console.error('Error saving accent color to user settings:', error);
      } finally {
        setSaving(false);
      }
    }
  };
  
  // Function to apply accent color classes to document
  const applyAccentColor = (color: AccentColor) => {
    const root = window.document.documentElement;
    
    console.log('Applying accent color:', color);
    
    // Remove existing accent color classes
    root.classList.remove('accent-blue', 'accent-green', 'accent-purple');
    
    // Definiere die Farbwerte basierend auf der ausgewählten Farbe
    let primaryColor, ringColor, webPdfColor;
    
    if (color === 'blue') {
      primaryColor = '#0284c7';
      ringColor = '#0284c7';
      webPdfColor = '#0284c7';
    } else if (color === 'green') {
      primaryColor = '#16a34a';
      ringColor = '#16a34a';
      webPdfColor = '#16a34a';
    } else if (color === 'purple') {
      primaryColor = '#9333ea';
      ringColor = '#9333ea';
      webPdfColor = '#9333ea';
    } else {
      // Default - verwende die Standardwerte aus dem CSS
      const darkMode = root.classList.contains('dark');
      primaryColor = darkMode ? '217.2 91.2% 59.8%' : '#0284c7';
      ringColor = darkMode ? '212.7 26.8% 83.9%' : '#0284c7';
      webPdfColor = darkMode ? '#16a34a' : '#0284c7';
    }
    
    // Wende die Farben direkt als CSS-Variablen an
    if (color !== 'default') {
      root.style.setProperty('--primary', primaryColor);
      root.style.setProperty('--ring', ringColor);
      root.style.setProperty('--web2pdf-600', webPdfColor);
      
      // Füge zusätzlich die Klasse hinzu
      root.classList.add(`accent-${color}`);
    } else {
      // Entferne die manuell gesetzten Properties, um zu den Standard-CSS-Werten zurückzukehren
      root.style.removeProperty('--primary');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--web2pdf-600');
    }
    
    // Erzwinge ein Style-Update
    forceStyleUpdate();
    
    // Log current classes for debugging
    console.log('Current classes:', root.className);
    console.log('Current styles:', {
      primary: root.style.getPropertyValue('--primary'),
      ring: root.style.getPropertyValue('--ring'),
      webPdf: root.style.getPropertyValue('--web2pdf-600')
    });
  };

  // Get theme and accent color from user settings on login
  useEffect(() => {
    // Stelle sicher, dass die Akzentfarbe beim Start angewendet wird
    applyAccentColor(accentColor);
    
    const getUserPreferences = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        
        // Get theme preference
        const themePreference = data.user?.user_metadata?.theme_preference;
        if (themePreference && isValidTheme(themePreference)) {
          setThemeState(themePreference);
          localStorage.setItem('theme', themePreference);
        }
        
        // Get accent color preference
        const colorPreference = data.user?.user_metadata?.accent_color_preference;
        if (colorPreference && isValidAccentColor(colorPreference)) {
          setAccentColorState(colorPreference);
          localStorage.setItem('accentColor', colorPreference);
          applyAccentColor(colorPreference);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    getUserPreferences();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          // Get theme preference
          const themePreference = session?.user?.user_metadata?.theme_preference;
          if (themePreference && isValidTheme(themePreference)) {
            setThemeState(themePreference);
            localStorage.setItem('theme', themePreference);
          }
          
          // Get accent color preference
          const colorPreference = session?.user?.user_metadata?.accent_color_preference;
          if (colorPreference && isValidAccentColor(colorPreference)) {
            setAccentColorState(colorPreference);
            localStorage.setItem('accentColor', colorPreference);
            applyAccentColor(colorPreference);
          }
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
  
  // Apply accent color on initial load and when it changes
  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

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
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, saving }}>
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
