import React, { useState, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  Platform,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DeviceType } from '../types/device';
import { CustomButton } from '../components/CustomButton';
import { fonts, getColors, Colors, dynamicBaseStyles } from '../styles/base';
import NativeModule from '../../specs/NativeModule';

const dynamicDeviceFormStyles = () => {
  const colors: Colors = getColors();
  const baseStyles = dynamicBaseStyles();

  return StyleSheet.create({
    input: baseStyles.input,
    title: baseStyles.title,
    buttonText: baseStyles.buttonText,
    outerContainer: {
      flex: 1,
      borderRadius: 8,
      backgroundColor: colors.background,
      width: '100%',
    },
    scrollContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 20,
    },
    formContainer: {
      padding: 15,
      width: '100%',
      maxWidth: 600, // Limit width on larger screens
    },
    label: {
      fontSize: fonts.mediumFontSize,
      marginBottom: 5,
      color: colors.text,
    },
    buttonContainer: {
      paddingVertical: 20,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
    },
    editButton: {
      ...baseStyles.button,
      width: 120,
      backgroundColor: colors.saveOrEditButtonColor,
    },
    deleteButton: {
      ...baseStyles.button,
      width: 120,
      backgroundColor: colors.deleteOrCancelButtonColor,
    },
    errorInput: {
      borderColor: 'red',
      borderRadius: 2,
    },
    errorText: {
      color: 'red',
      fontSize: fonts.mediumFontSize,
      fontWeight: 'bold',
      marginBottom: 10,
    },
  });
};

interface DeviceFormProps {
  initialDevice?: DeviceType;
  onSubmit: (device: DeviceType) => void;
  onCancel?: () => void;
  title?: string;
}

export const DeviceForm = ({
  initialDevice,
  onSubmit,
  onCancel,
  title,
}: DeviceFormProps) => {
  const [name, setName] = useState<string>(initialDevice?.name || '');
  const [macAddr, setMacAddr] = useState<string>(initialDevice?.macAddr || '');
  const [macAddrError, setMacAddrError] = useState<string | null>(null);
  const [ipAddr, setIpAddr] = useState<string>(initialDevice?.ipAddr || '');
  const [ipAddrError, setIpAddrError] = useState<string | null>(null);
  const [port, setPort] = useState<string>(initialDevice?.port || '');
  const [passwd, setPasswd] = useState<string>(initialDevice?.passwd || '');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const styles = dynamicDeviceFormStyles();

  // Reset scroll position when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  // Listen for keyboard show/hide events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSubmit = () => {
    if (!macAddr.trim()) {
      setMacAddrError('MAC Address is required');
      return;
    }

    const validMac = NativeModule.ValidMac(macAddr);
    if (!validMac) {
      setMacAddrError(
        'Invalid MAC Address, valid: AB-CD-EF-01-23-45, abcdef012345, or ab:cd:ef:01:23:45',
      );
    } else {
      setMacAddrError(null);
    }

    const validIp = NativeModule.ValidIp(ipAddr);
    if (ipAddr && !validIp) {
      setIpAddrError('Invalid IPv4 or IPv6 address');
    } else {
      setIpAddrError(null);
    }

    if (!validMac || (ipAddr && !validIp)) {
      return;
    }

    onSubmit({
      id: initialDevice?.id || Date.now().toString(),
      name: name.trim() || '',
      macAddr: macAddr.trim(),
      ipAddr: ipAddr.trim() || '',
      port: port.trim() || '',
      passwd: passwd.trim() || '',
    });

    setName('');
    setMacAddr('');
    setMacAddrError(null);
    setIpAddr('');
    setIpAddrError(null);
    setPort('');
    setPasswd('');
  };

  const handlePortInput = (text: string) => {
    if (text === '') {
      setPort('');
      return;
    }

    if (/^\d+$/.test(text)) {
      const num = parseInt(text, 10);
      if ((text.startsWith('0') && text.length > 1) || num > 65535) {
        return;
      }
      if (num >= 1 && num <= 65535) {
        setPort(text);
      }
    }
  };

  const handleIpAddrInput = (text: string) => {
    setIpAddr(text);
    if (text.trim() === '') {
      setIpAddrError(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
      style={styles.outerContainer}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: Math.max(keyboardHeight, 20) }, // Ensure enough padding for keyboard or content
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.formContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.label}>Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={styles.input.placeholderTextColor}
            value={name}
            onChangeText={setName}
            placeholder="Enter Name"
          />
          <Text style={styles.label}>MAC Address (Required)</Text>
          <TextInput
            style={[styles.input, macAddrError && styles.errorInput]}
            placeholderTextColor={styles.input.placeholderTextColor}
            value={macAddr}
            onChangeText={setMacAddr}
            maxLength={17}
            placeholder="Enter MAC Address"
          />
          {macAddrError && <Text style={styles.errorText}>{macAddrError}</Text>}
          <Text style={styles.label}>IP Address (Optional)</Text>
          <TextInput
            style={[styles.input, ipAddrError && styles.errorInput]}
            placeholderTextColor={styles.input.placeholderTextColor}
            value={ipAddr}
            onChangeText={handleIpAddrInput}
            maxLength={40}
            placeholder="Enter IPv4 or IPv6 Address"
          />
          {ipAddrError && <Text style={styles.errorText}>{ipAddrError}</Text>}
          <Text style={styles.label}>Port (Optional)</Text>
          <TextInput
            style={styles.input}
            inputMode={'numeric'}
            placeholderTextColor={styles.input.placeholderTextColor}
            value={port}
            onChangeText={handlePortInput}
            maxLength={5}
            placeholder="Enter Port (1-65535)"
          />
          <Text style={styles.label}>Password (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={styles.input.placeholderTextColor}
            value={passwd}
            onChangeText={setPasswd}
            placeholder="Enter Password"
          />
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Save"
              onPress={handleSubmit}
              buttonStyle={styles.editButton}
              buttonTextStyle={styles.buttonText}
            />
            {onCancel && (
              <CustomButton
                title="Cancel"
                onPress={onCancel}
                buttonStyle={styles.deleteButton}
                buttonTextStyle={styles.buttonText}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
