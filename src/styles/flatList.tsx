import { StyleSheet } from 'react-native';
import { fonts, getColors, Colors } from '../styles/base';

export const dynamicDeviceFlatListStyles = () => {
  const colors: Colors = getColors();

  return StyleSheet.create({
    list: {
      width: '100%',
    },
    itemContainer: {
      flexDirection: 'row',
      padding: 15,
      borderWidth: 2,
      borderColor: colors.borderColor,
      borderRadius: 8,
      backgroundColor: colors.background,
      marginVertical: 10,
    },
    textContainer: {
      flexGrow: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start', // Left-align text
      paddingRight: 15, // Space between text and buttons
    },
    text: {
      fontSize: fonts.mediumFontSize,
      color: colors.text,
      marginBottom: 8,
      textAlign: 'left',
    },
    buttonContainer: {
      flexDirection: 'column',
      justifyContent: 'space-between', // Center buttons vertically
      alignItems: 'center',
      width: 80,
    },
    buttonText: {
      color: colors.text,
      fontSize: fonts.mediumFontSize,
      textAlign: 'center',
    },
    wakeButton: {
      backgroundColor: '#40826D', // faded (darkish) green
      paddingVertical: 8,
      borderRadius: 5,
      width: '100%', // Full width of button container
      alignItems: 'center', // Center text in button
      justifyContent: 'center', // Center text vertically in button
    },
    editOrSubmitButton: {
      backgroundColor: colors.saveOrEditButtonColor,
      paddingVertical: 8,
      borderRadius: 5,
      width: '100%', // Full width of button container
      alignItems: 'center', // Center text in button
      justifyContent: 'center', // Center text vertically in button
    },
    deleteButton: {
      backgroundColor: colors.deleteOrCancelButtonColor,
      paddingVertical: 8,
      borderRadius: 5,
      width: '100%', // Full width of button container
      alignItems: 'center', // Center text in button
      justifyContent: 'center', // Center text vertically in button
    },
  });
};
