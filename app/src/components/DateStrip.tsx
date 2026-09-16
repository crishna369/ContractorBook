import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontFamily } from '../theme/typography';
import { dayAbbrev, dayNumber, isoDateAddDays, todayIsoDate } from '../utils/attendance';

type DateStripProps = {
  selectedDate: string;
  onSelect: (date: string) => void;
  daysBack?: number;
};

export function DateStrip({ selectedDate, onSelect, daysBack = 13 }: DateStripProps) {
  const scrollRef = useRef<ScrollView>(null);
  const today = todayIsoDate();
  const dates = Array.from({ length: daysBack + 1 }, (_, i) => isoDateAddDays(today, i - daysBack));

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {dates.map((date) => {
        const isSelected = date === selectedDate;
        return (
          <TouchableOpacity key={date} onPress={() => onSelect(date)} activeOpacity={0.8}>
            <View style={[styles.chip, isSelected && styles.chipSelected]}>
              <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{dayAbbrev(date)}</Text>
              <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>{dayNumber(date)}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  chip: {
    minWidth: 62,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 2,
  },
  chipSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  dayLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textMutedB,
  },
  dayLabelSelected: {
    color: colors.greenTintDark,
  },
  dayNumber: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: colors.textMutedA,
  },
  dayNumberSelected: {
    fontFamily: fontFamily.extraBold,
    color: colors.white,
  },
});
