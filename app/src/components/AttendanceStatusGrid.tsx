import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { ATTENDANCE_OPTIONS } from '../utils/attendance';

type AttendanceStatusGridProps = {
  value: number | null;
  onChange: (value: number) => void;
};

export function AttendanceStatusGrid({ value, onChange }: AttendanceStatusGridProps) {
  return (
    <View style={styles.row}>
      {ATTENDANCE_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.cell, selected && styles.cellSelected]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
            <Text style={[styles.value, selected && styles.valueSelected]}>{option.value}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 7,
  },
  cell: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.chipBg,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 3,
  },
  cellSelected: {
    backgroundColor: colors.primaryDark,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textMutedA,
  },
  labelSelected: {
    color: colors.white,
  },
  value: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    color: colors.textMutedB,
  },
  valueSelected: {
    color: colors.greenTintDark,
  },
});
