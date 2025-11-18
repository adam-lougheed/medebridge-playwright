'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only apply dark mode if explicitly set to 'true' in localStorage
    // Default to light mode if not set or set to anything other than 'true'
    const darkModeValue = localStorage.getItem('darkMode');
    const isDarkMode = darkModeValue === 'true';
    const htmlElement = document.documentElement;
    
    // Always remove dark class first, then add if needed
    htmlElement.classList.remove('dark');
    
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    }
  }, []);

  return <>{children}</>;
}

