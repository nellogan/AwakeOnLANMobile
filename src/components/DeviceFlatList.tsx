import React from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { useDeviceContext } from '../contexts/DeviceContext';
import { CustomButton } from './CustomButton';
import { dynamicDeviceFlatListStyles } from '../styles/flatList';
import NativeModule from '../../specs/NativeModule';
import { DeviceType } from '../types/device';

interface DeviceFlatListProps {
  setEditingDevice: (device: DeviceType | null) => void;
}

export const DeviceFlatList = ({ setEditingDevice }: DeviceFlatListProps) => {
  const { devices, deleteDevice } = useDeviceContext(); // Destructure only the necessary functions from useDeviceContext() hook
  const styles = dynamicDeviceFlatListStyles();

  const buildMessage = (item: DeviceType) => {
    const fields = [];
    if (item.name) fields.push(`Name: ${item.name}`);
    if (item.macAddr) fields.push(`MAC: ${item.macAddr}`);
    if (item.ipAddr) fields.push(`IP: ${item.ipAddr}`);
    if (item.port) fields.push(`Port: ${item.port}`);
    if (item.passwd) fields.push(`Passwd: ${item.passwd}`);
    return fields.join('\n');
  };

  const wakeButton = (item: DeviceType) => {
    try {
      NativeModule.SendWOL(item.macAddr, item.ipAddr, item.port, item.passwd);
    } catch (error) {
      console.error('An error occurred:', error);
    }

    Alert.alert('Wake On LAN packet sent to:', buildMessage(item), [
      { text: 'OK' },
    ]);
  };

  const deleteButton = (item: DeviceType) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${item.name || 'this device'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteDevice(item.id) },
      ],
    );
  };

  const renderItem = ({ item }: { item: DeviceType }) => (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Name: {item.name || 'N/A'}</Text>
        <Text style={styles.text}>MAC: {item.macAddr}</Text>
        <Text style={styles.text}>IP: {item.ipAddr || 'N/A'}</Text>
        <Text style={styles.text}>Port: {item.port || 'N/A'}</Text>
        <Text style={styles.text}>Passwd: {item.passwd || 'N/A'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Wake"
          onPress={() => wakeButton(item)}
          buttonStyle={styles.wakeButton}
          buttonTextStyle={styles.buttonText}
        />

        <CustomButton
          title="Edit"
          onPress={() => setEditingDevice(item)}
          buttonStyle={styles.editOrSubmitButton}
          buttonTextStyle={styles.buttonText}
        />

        <CustomButton
          title="Delete"
          onPress={() => deleteButton(item)}
          buttonStyle={styles.deleteButton}
          buttonTextStyle={styles.buttonText}
        />
      </View>
    </View>
  );

  return (
    <FlatList
      data={devices}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      style={styles.list}
    />
  );
};
