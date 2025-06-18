import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface FontSizes {
  smallFontSize: number;
  mediumFontSize: number;
  largeFontSize: number;
}

export const fonts: FontSizes = {
  smallFontSize: 12,
  mediumFontSize: 16,
  largeFontSize: 24,
};

export interface Colors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  borderColor: string;
  placeholderText: string;
  saveOrEditButtonColor: string;
  deleteOrCancelButtonColor: string;
}

export const lightTheme: Colors = {
  background: '#e6e6e6',
  text: '#212121',
  primary: '#49b5e6',
  secondary: '#000767',
  borderColor: '#b0bec5',
  placeholderText: '#b9b9b9',
  saveOrEditButtonColor: '#007aff',
  deleteOrCancelButtonColor: '#ff4444',
};

export const darkTheme: Colors = {
  background: '#121212',
  text: '#e0e0e0',
  primary: '#1976d2',
  secondary: '#49b5e6',
  borderColor: '#546e7a',
  placeholderText: '#727272',
  saveOrEditButtonColor: '#007aff',
  deleteOrCancelButtonColor: '#ff4444',
};

export const getColors = () => {
  const { isDarkMode }: boolean = useTheme();
  return isDarkMode === false ? lightTheme : darkTheme;
};

export const dynamicBaseStyles = () => {
  const colors: Colors = getColors();

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      // Platform-specific padding to play nice with Modal since it implicitly accounts for the
      // StatusBar with no control over it
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 10,
      backgroundColor: colors.primary,
    },
    title: {
      fontSize: fonts.largeFontSize,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: colors.text,
    },
    input: {
      width: '100%',
      borderWidth: 2,
      borderColor: colors.borderColor,
      backgroundColor: colors.background,
      color: colors.text,
      placeholderTextColor: colors.placeholderText,
      padding: 10,
      marginBottom: 10,
      borderRadius: 5,
      fontSize: fonts.mediumFontSize,
    },
    text: {
      color: colors.text,
    },
    button: {
      borderRadius: 5,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: colors.text,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    saveOrEditButtonColor: colors.saveOrEditButtonColor, // blue
    deleteOrCancelButtonColor: colors.deleteOrCancelButtonColor, // red
  });
};
