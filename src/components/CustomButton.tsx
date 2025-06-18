import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface CustomButtonProps {
  arg?: string; // Optional arg
  title: string;
  onPress: (arg?: string) => void;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  arg,
  title,
  onPress,
  buttonStyle,
  buttonTextStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={() => onPress(arg)}
      disabled={disabled}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};
