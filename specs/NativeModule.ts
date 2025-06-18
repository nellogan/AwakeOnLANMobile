import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  readonly ValidMac: (input: string) => boolean;
  readonly ValidIp: (input: string) => boolean;
  readonly SendWOL: (
    mac_addr: string,
    ip_addr: string,
    port: string,
    passwd: string,
  ) => void;
  readonly ScanHosts: (input: string, mode: string) => Promise<string[][]>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeModule');
