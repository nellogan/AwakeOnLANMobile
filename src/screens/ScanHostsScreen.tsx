import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Keyboard,
} from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { CustomRadioButton } from '../components/CustomRadioButton';
import { fonts, getColors, Colors, dynamicBaseStyles } from '../styles/base';
import { dynamicDeviceFlatListStyles } from '../styles/flatList';
import NativeModule from '../../specs/NativeModule';

interface ScanResult {
  host: string;
  items: [string, string][];
}

interface RadioButtonStyle {
  radioGroup: {
    flexDirection: 'row';
    justifyContent: 'space-around';
    marginVertical: number;
  };
  radioContainer: {
    flexDirection: 'row';
    alignItems: 'center';
  };
  radioCircle: {
    width: number;
    height: number;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    alignItems: 'center';
    justifyContent: 'center';
    marginRight: number;
  };
  radioSelected: {
    backgroundColor: string;
  };
  radioInnerCircle: {
    width: number;
    height: number;
    borderRadius: number;
    backgroundColor: string;
  };
  radioText: {
    fontSize: number;
    color: string;
  };
}

interface Styles {
  baseContainer: ViewStyle;
  input: TextStyle;
  list: ViewStyle;
  itemContainer: ViewStyle;
  textContainer: ViewStyle;
  text: TextStyle;
  placeholderTextColor: string;
  container: {
    flex: number;
    padding: number;
    borderRadius: number;
    backgroundColor: string;
    width: string;
  };
  radioButtonStyle: RadioButtonStyle;
  buttonContainer: {
    paddingTop: number;
    flexDirection: 'row';
    justifyContent: 'space-evenly';
  };
  buttonText: {
    fontSize: number;
  };
  scanButton: {
    width: number;
    backgroundColor: string;
  };
  clearResultsButtonActive: {
    width: number;
    backgroundColor: string;
  };
  clearResultsButtonDisabled: {
    width: number;
    backgroundColor: string;
  };
  inputError: {
    borderColor: string;
    borderWidth: number;
  };
  errorText: {
    color: string;
    fontSize: number;
    fontWeight: string;
    marginBottom: number;
  };
  spinner: {
    marginTop: number;
    color: string;
  };
  resultsHeader: {
    fontSize: number;
    color: string;
    fontWeight: string;
    marginTop: number;
    marginBottom: number;
  };
  noResults: {
    fontSize: number;
    color: string;
    textAlign: string;
    marginTop: number;
  };
}

const useDynamicStyles = (): Styles => {
  const colors: Colors = getColors();
  const baseStyles = dynamicBaseStyles();
  const flatListStyles = dynamicDeviceFlatListStyles();

  return StyleSheet.create({
    baseContainer: baseStyles.container,
    input: baseStyles.input,
    list: flatListStyles.list,
    itemContainer: flatListStyles.itemContainer,
    textContainer: flatListStyles.textContainer,
    text: flatListStyles.text,
    placeholderTextColor: colors.placeholderText,
    container: {
      flex: 1,
      padding: 15,
      borderRadius: 8,
      backgroundColor: colors.background,
      width: '100%',
    },
    radioButtonStyle: {
      radioGroup: {
        flexDirection: 'row' as const,
        justifyContent: 'space-around' as const,
        marginVertical: 5,
      },
      radioContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
      },
      radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.secondary,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginRight: 10,
      },
      radioSelected: {
        backgroundColor: colors.primary,
      },
      radioInnerCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.text,
      },
      radioText: {
        fontSize: fonts.mediumFontSize,
        color: colors.text,
      },
    },
    buttonContainer: {
      paddingTop: 15,
      flexDirection: 'row' as const,
      justifyContent: 'space-evenly' as const,
    },
    buttonText: {
      ...baseStyles.buttonText,
      fontSize: fonts.mediumFontSize,
    },
    scanButton: {
      ...baseStyles.button,
      width: 120,
      backgroundColor: colors.saveOrEditButtonColor,
    },
    clearResultsButtonActive: {
      ...baseStyles.button,
      width: 120,
      backgroundColor: colors.deleteOrCancelButtonColor,
    },
    clearResultsButtonDisabled: {
      ...baseStyles.button,
      width: 120,
      backgroundColor: colors.borderColor,
    },
    inputError: {
      borderColor: 'red',
      borderWidth: 2,
    },
    errorText: {
      color: 'red',
      fontSize: fonts.mediumFontSize,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    spinner: {
      marginTop: 20,
      color: colors.secondary,
    },
    resultsHeader: {
      fontSize: fonts.largeFontSize,
      color: colors.text,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
    },
    noResults: {
      fontSize: fonts.mediumFontSize,
      color: colors.text,
      textAlign: 'center' as const,
      marginTop: 20,
    },
  });
};

export const ScanHostsScreen = () => {
  const radioOptions = ['Ping', 'TCP Connect'];
  const [selectedOption, setSelectedOption] = useState<string>(radioOptions[0]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styles = useDynamicStyles();

  const handleScanButtonPress = async (): Promise<void> => {
    Keyboard.dismiss(); // Close the keyboard
    if (!inputValue.trim()) {
      setError('Enter a valid IP Address');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const results: string[][] = await NativeModule.ScanHosts(
        inputValue,
        selectedOption,
      );
      setScanResult({ host: inputValue, items: results });
      setInputValue('');
    } catch (error) {
      setError('Invalid IP Address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearButtonPress = (): void => {
    setScanResult(null);
    setError(null);
  };

  const renderItem = ({ item }: { item: [string, string] }) => (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>IP: {item[0]}</Text>
        <Text style={styles.text}>Hostname: {item[1]}</Text>
      </View>
    </View>
  );

  const isClearButtonActive: boolean =
    scanResult?.items?.length > 0 && isLoading === false;

  return (
    <SafeAreaView style={styles.baseContainer}>
      <View style={styles.container}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="IPv4 Address (e.g. 192.168.1.1/24)"
          placeholderTextColor={styles.input.placeholderTextColor}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
        <CustomRadioButton
          options={radioOptions}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          radioButtonStyle={styles.radioButtonStyle}
        />
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Scan"
            onPress={handleScanButtonPress}
            buttonStyle={styles.scanButton}
            buttonTextStyle={styles.buttonText}
          />
          <CustomButton
            title="Clear Results"
            onPress={handleClearButtonPress}
            buttonStyle={
              isClearButtonActive
                ? styles.clearResultsButtonActive
                : styles.clearResultsButtonDisabled
            }
            buttonTextStyle={styles.buttonText}
            disabled={!isClearButtonActive}
          />
        </View>
        {isLoading && (
          <ActivityIndicator
            size="large"
            color={styles.spinner.color}
            style={styles.spinner}
          />
        )}
        {scanResult && !isLoading && (
          <>
            <Text style={styles.resultsHeader}>
              Results for {scanResult.host}:
            </Text>
            {scanResult.items?.length > 0 ? (
              <FlatList
                data={scanResult.items}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                style={styles.list}
              />
            ) : (
              <Text style={styles.noResults}>No results found.</Text>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};
