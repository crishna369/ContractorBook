import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type ProgressBarProps = {
  value: number; // 0-1
  color?: string;
  height?: number;
};

export function ProgressBar({ value, color = colors.accentGreen, height = 8 }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

export type StackedSegment = {
  value: number;
  color: string;
};

type StackedProgressBarProps = {
  segments: StackedSegment[];
  height?: number;
};

export function StackedProgressBar({ segments, height = 8 }: StackedProgressBarProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  return (
    <View style={[styles.track, styles.stackedTrack, { height, borderRadius: height / 2 }]}>
      {total > 0 &&
        segments.map((s, i) => (
          <View
            key={i}
            style={{ width: `${(Math.max(0, s.value) / total) * 100}%`, backgroundColor: s.color, height: '100%' }}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.bgCanvas,
    overflow: 'hidden',
  },
  stackedTrack: {
    flexDirection: 'row',
  },
  fill: {
    height: '100%',
  },
});
