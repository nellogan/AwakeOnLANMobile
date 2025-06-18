import React from 'react';
import packageJson from '../../package.json';
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { useTheme } from '../contexts/ThemeContext';
import {
  fonts,
  lightTheme,
  darkTheme,
  getColors,
  Colors,
} from '../styles/base';

const dynamicModalStyles = () => {
  const colors: Colors = getColors();

  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-start' as const,
      alignItems: 'flex-end' as const,
    },
    modalContent: {
      width: 250,
      marginTop: 60,
      marginRight: 10,
      borderRadius: 8,
      padding: 10,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      backgroundColor: colors.primary,
    },
    modalItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalItemText: {
      fontSize: fonts.mediumFontSize,
      fontWeight: '500',
      color: colors.text,
    },
    contactText: {
      fontSize: fonts.smallFontSize,
      marginTop: 5,
      color: colors.text,
    },
  });
};

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MenuModal = ({ visible, onClose }: MenuModalProps) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const styles = dynamicModalStyles();
  const { version } = packageJson;

  const toggleThemeButton = () => {
    toggleTheme();
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <CustomButton
            title={isDarkMode ? 'Toggle Light Mode ☀️' : 'Toggle Dark Mode 🌘'}
            onPress={toggleThemeButton}
            buttonStyle={styles.modalItem}
            buttonTextStyle={styles.modalItemText}
          />

          <TouchableOpacity style={styles.modalItem} onPress={onClose}>
            <Text style={styles.modalItemText}>App Info:</Text>
            <Text style={styles.contactText}>
              License: GPLv3
              {'\n'}
              Source: https://github.com/nellogan/AwakeOnLANMobile
              {'\n'}
              Report Issues: https://github.com/nellogan/AwakeOnLANMobile/issues
              {'\n'}
              Version: {version}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};
