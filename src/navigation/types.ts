import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Permission: undefined;
  HowToSetup: undefined;
  RecordFace: undefined;
};

export type PermissionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Permission'
>;

export type HowToSetupScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'HowToSetup'
>;

export type RecordFaceScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'RecordFace'
>;
