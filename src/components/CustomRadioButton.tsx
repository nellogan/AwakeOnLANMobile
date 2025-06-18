import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

interface RadioButtonStyles {
  radioGroup: StyleProp<ViewStyle>;
  radioContainer: StyleProp<ViewStyle>;
  radioCircle: StyleProp<ViewStyle>;
  radioSelected: StyleProp<ViewStyle>;
  radioInnerCircle: StyleProp<ViewStyle>;
  radioText: StyleProp<TextStyle>;
}

interface CustomRadioButtonProps {
  options: string[];
  selectedOption?: string;
  setSelectedOption: (option: string) => void;
  radioButtonStyle: RadioButtonStyles;
}

export const CustomRadioButton = ({
  options,
  selectedOption,
  setSelectedOption,
  radioButtonStyle,
}: CustomRadioButtonProps) => {
  const renderRadioButton = (option: string) => (
    <TouchableOpacity
      style={radioButtonStyle.radioContainer}
      onPress={() => setSelectedOption(option)}
      key={option}
    >
      <View
        style={[
          radioButtonStyle.radioCircle,
          selectedOption === option && radioButtonStyle.radioSelected,
        ]}
      >
        {selectedOption === option && (
          <View style={radioButtonStyle.radioInnerCircle} />
        )}
      </View>
      <Text style={radioButtonStyle.radioText}>{option}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={radioButtonStyle.radioGroup}>
      {options.map(option => renderRadioButton(option))}
    </View>
  );
};
