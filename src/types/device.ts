export type DeviceType = {
  id: string;
  name?: string;
  macAddr: string;
  ipAddr?: string;
  port?: string;
  passwd?: string;
};

export type DeviceContextType = {
  devices: DeviceType[];
  addDevice: (device: DeviceType) => void;
  updateDevice: (id: string, updatedDevice: DeviceType) => void;
  deleteDevice: (id: string) => void;
};
