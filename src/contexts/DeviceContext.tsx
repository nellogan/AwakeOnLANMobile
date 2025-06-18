import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { DeviceType, DeviceContextType } from '../types/device';

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
};

const DEVICE_FILE = `${RNFS.DocumentDirectoryPath}/devices.json`;

// todo change devices from array to dictionary -- low prio not many entries expected
export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [devices, setDevices] = useState<DeviceType[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadDevices = async () => {
      try {
        const exists = await RNFS.exists(DEVICE_FILE);
        if (exists && isMounted) {
          const data = await RNFS.readFile(DEVICE_FILE);
          setDevices(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading devices:', error);
      }
    };

    loadDevices();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveDevicesToFile = async (updatedDevices: DeviceType[]) => {
    try {
      await RNFS.writeFile(DEVICE_FILE, JSON.stringify(updatedDevices));
    } catch (error) {
      console.error('Error saving devices:', error);
    }
  };

  const addDevice = (device: DeviceType) => {
    const updatedDevices = [...devices, device];
    setDevices(updatedDevices);
    saveDevicesToFile(updatedDevices);
    Alert.alert(
      'Device saved successfully!',
      '',
      [{ text: 'OK', onPress: () => {} }],
      { cancelable: false },
    );
  };

  const updateDevice = (id: string, updatedDevice: DeviceType) => {
    const updatedDevices = devices.map(device =>
      device.id === id ? updatedDevice : device,
    );
    setDevices(updatedDevices);
    saveDevicesToFile(updatedDevices);
  };

  const deleteDevice = (id: string) => {
    const updatedDevices = devices.filter(device => device.id !== id);
    setDevices(updatedDevices);
    saveDevicesToFile(updatedDevices);
  };

  return (
    <DeviceContext.Provider
      value={{ devices, addDevice, updateDevice, deleteDevice }}
    >
      {children}
    </DeviceContext.Provider>
  );
};
