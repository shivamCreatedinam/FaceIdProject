import Svg, { Circle, Path, Rect } from 'react-native-svg';

type FaceGlyphProps = {
  size?: number;
  color?: string;
};

export function FaceGlyph({ size = 118, color = '#D1D1D6' }: FaceGlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle
        cx="60"
        cy="60"
        r="40"
        stroke={color}
        strokeWidth="3"
        fill="none"
      />
      <Rect x="43.5" y="44" width="5.5" height="15" rx="2.75" fill={color} />
      <Rect x="71" y="44" width="5.5" height="15" rx="2.75" fill={color} />
      <Path
        d="M60 58c.8 5 1.2 8 .2 13"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M40 78c7 16 33 16 40 0"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
