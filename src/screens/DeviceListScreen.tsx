import React, { useState } from 'react';
import { SafeAreaView, Text, StatusBar } from 'react-native';
import { DeviceType } from '../types/device.ts';
import { useDeviceContext } from '../contexts/DeviceContext';
import { DeviceFlatList } from '../components/DeviceFlatList';
import { EditDeviceModal } from '../components/EditDeviceModal';
import { dynamicBaseStyles } from '../styles/base';

export const DeviceListScreen = () => {
  const [editingDevice, setEditingDevice] = useState<DeviceType | null>(null);
  const { devices } = useDeviceContext();
  const styles = dynamicBaseStyles();

  return (
    <SafeAreaView style={styles.container}>
      {devices.length === 0 ? (
        <Text style={[styles.text, { fontSize: 24, fontWeight: 'bold' }]}>
          No devices saved
        </Text>
      ) : (
        <>
          <DeviceFlatList setEditingDevice={setEditingDevice} />
          <EditDeviceModal
            editingDevice={editingDevice}
            setEditingDevice={setEditingDevice}
          />
        </>
      )}
    </SafeAreaView>
  );
};
