
// This file is now deprecated in favor of the ThemeContext approach.
// We're just re-exporting from the context for compatibility.

import { useTheme as useThemeContext } from "@/contexts/ThemeContext";

export const useTheme = useThemeContext;
