import { View } from 'react-native';
import { RING_TICKS } from '../services/faceCircle';
import { colors } from '../theme/colors';

type TickRingProps = {
  size: number;
  activeTicks?: ReadonlySet<number>;
  dimOpacity?: number;
  activeColor?: string;
};

export function TickRing({
  size,
  activeTicks,
  dimOpacity = 0.72,
  activeColor,
}: TickRingProps) {
  const tickWidth = Math.max(2.5, size * 0.012);
  const tickHeight = size * 0.058;
  const radius = size / 2 - tickHeight / 2;
  const highlightAll = activeTicks == null;

  const ringStyle = { width: size, height: size };

  return (
    <View style={ringStyle}>
      {Array.from({ length: RING_TICKS }, (_, index) => {
        const theta = (index / RING_TICKS) * Math.PI * 2 - Math.PI / 2;
        const centerX = size / 2 + Math.cos(theta) * radius;
        const centerY = size / 2 + Math.sin(theta) * radius;
        const filled = highlightAll || activeTicks.has(index);
        const tickStyle = {
          position: 'absolute' as const,
          width: tickWidth,
          height: tickHeight,
          borderRadius: tickWidth,
          backgroundColor: filled && activeColor ? activeColor : colors.tick,
          opacity: filled ? 1 : dimOpacity,
          left: centerX - tickWidth / 2,
          top: centerY - tickHeight / 2,
          transform: [{ rotate: `${(theta * 180) / Math.PI + 90}deg` }],
        };

        return <View key={index} style={tickStyle} />;
      })}
    </View>
  );
}
