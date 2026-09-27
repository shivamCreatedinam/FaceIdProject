import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HowToSetupScreen } from '../screens/HowToSetupScreen';
import { PermissionScreen } from '../screens/PermissionScreen';
import { RecordFaceScreen } from '../screens/RecordFaceScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Permission"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
          gestureEnabled: true,
        }}>
        <Stack.Screen name="Permission" component={PermissionScreen} />
        <Stack.Screen name="HowToSetup" component={HowToSetupScreen} />
        <Stack.Screen name="RecordFace" component={RecordFaceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
