import { StyleSheet, View } from 'react-native';

import { Palette } from '@/theme/tokens';

interface Piece {
  left: `${number}%`;
  top: number;
  rotate: `${number}deg`;
  color: string;
  size: number;
  shape: 'square' | 'circle';
}

const PIECES: Piece[] = [
  { left: '10%', top: 6, rotate: '18deg', color: Palette.blue, size: 8, shape: 'square' },
  { left: '22%', top: 32, rotate: '-12deg', color: Palette.lime, size: 6, shape: 'circle' },
  { left: '78%', top: 10, rotate: '-24deg', color: Palette.mint, size: 7, shape: 'square' },
  { left: '88%', top: 34, rotate: '10deg', color: Palette.blue, size: 6, shape: 'circle' },
  { left: '48%', top: 0, rotate: '8deg', color: Palette.amber, size: 7, shape: 'square' },
  { left: '35%', top: 20, rotate: '-30deg', color: Palette.mint, size: 5, shape: 'circle' },
  { left: '64%', top: 22, rotate: '22deg', color: Palette.lime, size: 6, shape: 'square' },
];

/** A restrained handful of static confetti pieces near the top of Session Complete — not a full animated cannon. */
export function Confetti() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {PIECES.map((piece, i) => (
        <View
          key={i}
          style={[
            styles.piece,
            {
              left: piece.left,
              top: piece.top,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.shape === 'circle' ? piece.size / 2 : 2,
              transform: [{ rotate: piece.rotate }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 60,
  },
  piece: {
    position: 'absolute',
    opacity: 0.85,
  },
});
