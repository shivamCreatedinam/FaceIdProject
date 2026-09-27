import { Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  type PermissionStatus,
} from 'react-native-permissions';

const cameraPermission =
  Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

export async function getCameraPermission(): Promise<PermissionStatus> {
  return check(cameraPermission);
}

export async function ensureCameraPermission(): Promise<PermissionStatus> {
  const current = await check(cameraPermission);
  if (
    current === RESULTS.GRANTED ||
    current === RESULTS.LIMITED ||
    current === RESULTS.BLOCKED
  ) {
    return current;
  }
  return request(cameraPermission);
}

export function isCameraGranted(status: PermissionStatus): boolean {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}
