import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { fontFamily, typography } from '../theme/typography';

type DateFieldProps = {
  label: string;
  value: string | null; // ISO date, e.g. "2026-09-14"
  onChange: (isoDate: string | null) => void;
  placeholder?: string;
  clearable?: boolean;
};

function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplay(iso: string): string {
  // Avoid UTC-shift issues by parsing the y/m/d parts directly.
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year!, month! - 1, day!);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function DateField({ label, value, onChange, placeholder = 'Select date', clearable = true }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  function handleValueChange(_event: unknown, selected?: Date) {
    setShowPicker(false);
    if (selected) {
      onChange(toIsoDate(selected));
    }
  }

  function handleDismiss() {
    setShowPicker(false);
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.field} onPress={() => setShowPicker(true)}>
          <Text style={value ? styles.valueText : styles.placeholderText}>
            {value ? formatDisplay(value) : placeholder}
          </Text>
        </TouchableOpacity>
        {clearable && value && (
          <TouchableOpacity style={styles.clearButton} onPress={() => onChange(null)}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value + 'T00:00:00') : new Date()}
          mode="date"
          display="default"
          onValueChange={handleValueChange}
          onDismiss={handleDismiss}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.textMutedA,
    textTransform: 'none',
    letterSpacing: 0,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  field: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.tileSmall,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  valueText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
  },
  placeholderText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textMutedA,
  },
  clearButton: {
    paddingHorizontal: 4,
  },
  clearText: {
    ...typography.body,
    color: colors.accentGreen,
  },
});
