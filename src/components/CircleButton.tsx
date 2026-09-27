import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

type CircleButtonProps = {
  icon: 'back' | 'close';
  onPress: () => void;
  accessibilityLabel: string;
};

export function CircleButton({
  icon,
  onPress,
  accessibilityLabel,
}: CircleButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      {icon === 'back' ? (
        <Svg width={14} height={22} viewBox="0 0 14 22">
          <Path
            d="M11 2.5L3 11l8 8.5"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      ) : (
        <Svg width={16} height={16} viewBox="0 0 16 16">
          <Path
            d="M3 3l10 10M13 3L3 13"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.circleButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
