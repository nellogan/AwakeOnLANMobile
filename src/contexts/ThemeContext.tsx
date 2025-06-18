import React, { createContext, useState, useContext, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import RNFS from 'react-native-fs';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  toggleTheme: () => {},
});

const THEME_FILE_PATH = `${RNFS.DocumentDirectoryPath}/theme.json`;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Load theme from file when component mounts
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const exists = await RNFS.exists(THEME_FILE_PATH);
        if (exists) {
          const data = await RNFS.readFile(THEME_FILE_PATH, 'utf8');
          const parsed = JSON.parse(data);
          if (typeof parsed.isDarkMode === 'boolean') {
            setIsDarkMode(parsed.isDarkMode);
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      // Save theme to file
      RNFS.writeFile(
        THEME_FILE_PATH,
        JSON.stringify({ isDarkMode: newMode }),
        'utf8',
      ).catch(error => console.error('Error saving theme:', error));
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
