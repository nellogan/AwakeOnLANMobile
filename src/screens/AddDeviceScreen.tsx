import React from 'react';
import { SafeAreaView } from 'react-native';
import { useDeviceContext } from '../contexts/DeviceContext';
import { DeviceForm } from '../components/DeviceForm';
import { dynamicBaseStyles } from '../styles/base';

export const AddDeviceScreen = () => {
  const { addDevice } = useDeviceContext();
  const styles = dynamicBaseStyles();

  return (
    <SafeAreaView style={styles.container}>
      <DeviceForm onSubmit={addDevice} title={'Add Device'} />
    </SafeAreaView>
  );
};
