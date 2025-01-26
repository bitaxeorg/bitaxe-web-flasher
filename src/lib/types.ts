// Add any shared types here
export type DeviceModel = 'max' | 'ultra' | 'supra' | 'gamma' | 'ultrahex' | 'suprahex';

export type FirmwareData = {
  devices: Device[]
}

type Device = {
  name: string
  boards: Board[]
}

type Board = {
  name: string
  supported_firmware: Firmware[]
}

type Firmware = {
  version: string
  path: string
}