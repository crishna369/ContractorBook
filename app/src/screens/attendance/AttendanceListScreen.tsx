import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { DateStrip } from '../../components/DateStrip';
import { useWorkers } from '../../api/hooks/useWorkers';
import { useSites } from '../../api/hooks/useSites';
import { useAttendanceForDate } from '../../api/hooks/useAttendance';
import { attendanceTermFor, todayIsoDate } from '../../utils/attendance';
import type { AttendanceEntry, Worker } from '../../types/api';
import type { AttendanceStackParamList } from '../../navigation/AttendanceStack';

type NavProp = NativeStackNavigationProp<AttendanceStackParamList, 'AttendanceList'>;

function NotMarkedRow({ worker, onPress }: { worker: Worker; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.row, styles.notMarkedCard]}>
        <Avatar name={worker.name} />
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{worker.name}</Text>
          <Text style={styles.rowMeta}>₹{worker.daily_wage}/day</Text>
        </View>
        <View style={styles.markPill}>
          <Text style={styles.markPillLabel}>Mark</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function MarkedRow({
  worker,
  entries,
  siteNameFor,
  onPress,
}: {
  worker: Worker;
  entries: AttendanceEntry[];
  siteNameFor: (siteId: string) => string;
  onPress: () => void;
}) {
  const totalValue = entries.reduce((sum, e) => sum + Number(e.value), 0);
  const totalEarnings = entries.reduce((sum, e) => sum + Number(e.earnings), 0);
  const isAbsent = totalValue === 0;
  const showChips = !(entries.length === 1 && Number(entries[0]!.value) === 0);

  let statusLabel: string;
  let statusColor: string = colors.textMutedA;
  if (isAbsent) {
    statusLabel = 'Absent';
  } else if (entries.length === 1) {
    const term = attendanceTermFor(Number(entries[0]!.value));
    statusLabel = term === 'Savai' || term === 'Dedhi' ? `${term} · ${entries[0]!.value}` : `${entries[0]!.value} day`;
    if (term === 'Savai' || term === 'Dedhi') statusColor = colors.warningDark;
  } else {
    statusLabel = `${totalValue} day`;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.markedCard}>
        <View style={styles.row}>
          <Avatar name={worker.name} />
          <View style={styles.rowInfo}>
            <Text style={styles.rowName}>{worker.name}</Text>
            <Text style={styles.rowMeta}>₹{worker.daily_wage}/day</Text>
          </View>
          <View style={styles.markedAmountCol}>
            <Text style={[styles.markedAmount, isAbsent && styles.mutedAmount]}>₹{Math.round(totalEarnings)}</Text>
            <Text style={[styles.markedStatus, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        {showChips && (
          <View style={styles.chipRow}>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.chip}>
                <Text style={styles.chipText}>
                  {siteNameFor(entry.site_id)} · <Text style={styles.chipValue}>{entry.value}</Text>
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

export function AttendanceListScreen() {
  const navigation = useNavigation<NavProp>();
  const [selectedDate, setSelectedDate] = useState(todayIsoDate());
  const [search, setSearch] = useState('');

  const { data: workers, isLoading: workersLoading, error: workersError } = useWorkers();
  const { data: sites } = useSites();
  const {
    data: attendanceEntries,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useAttendanceForDate(selectedDate);

  const sitesById = useMemo(() => new Map((sites ?? []).map((s) => [s.id, s.name])), [sites]);
  const siteNameFor = (siteId: string) => sitesById.get(siteId) ?? 'Unknown site';

  const activeWorkers = useMemo(() => (workers ?? []).filter((w) => w.is_active), [workers]);
  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activeWorkers;
    return activeWorkers.filter((w) => w.name.toLowerCase().includes(query));
  }, [activeWorkers, search]);

  const entriesByWorker = useMemo(() => {
    const map = new Map<string, AttendanceEntry[]>();
    for (const entry of attendanceEntries ?? []) {
      const list = map.get(entry.worker_id) ?? [];
      list.push(entry);
      map.set(entry.worker_id, list);
    }
    return map;
  }, [attendanceEntries]);

  const notMarked = filteredWorkers.filter((w) => !entriesByWorker.has(w.id));
  const marked = filteredWorkers.filter((w) => entriesByWorker.has(w.id));

  const isLoading = workersLoading || attendanceLoading;
  const error = workersError || attendanceError;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
      </View>

      <DateStrip selectedDate={selectedDate} onSelect={setSelectedDate} />

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search worker"
          placeholderTextColor={colors.textMutedB}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading && <ActivityIndicator color={colors.primaryDark} style={{ marginTop: 12 }} />}
      {error && <Text style={styles.error}>Couldn't load attendance: {String(error)}</Text>}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!isLoading && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Not marked · {notMarked.length}</Text>
            </View>
            <View style={styles.sectionList}>
              {notMarked.map((worker) => (
                <NotMarkedRow
                  key={worker.id}
                  worker={worker}
                  onPress={() => navigation.navigate('MarkAttendance', { workerId: worker.id, date: selectedDate })}
                />
              ))}
              {notMarked.length === 0 && <EmptyState label="Everyone is marked for this day" />}
            </View>

            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionLabel}>Marked · {marked.length}</Text>
            </View>
            <View style={styles.sectionList}>
              {marked.map((worker) => (
                <MarkedRow
                  key={worker.id}
                  worker={worker}
                  entries={entriesByWorker.get(worker.id) ?? []}
                  siteNameFor={siteNameFor}
                  onPress={() => navigation.navigate('MarkAttendance', { workerId: worker.id, date: selectedDate })}
                />
              ))}
              {marked.length === 0 && <EmptyState label="No one marked yet" />}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPaper,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.cardGap,
  },
  title: {
    ...typography.headerLarge,
    color: colors.ink,
  },
  searchBar: {
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginTop: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.tileSmall,
    paddingHorizontal: 14,
  },
  searchInput: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMutedB,
    textTransform: 'uppercase',
  },
  sectionList: {
    gap: spacing.cardGap,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notMarkedCard: {
    padding: spacing.cardPaddingSmall,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  rowMeta: {
    ...typography.label,
    color: colors.textMutedA,
    marginTop: 2,
    textTransform: 'none',
    letterSpacing: 0,
  },
  markPill: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  markPillLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.white,
  },
  markedCard: {
    padding: spacing.cardPaddingSmall,
    gap: 12,
  },
  markedAmountCol: {
    alignItems: 'flex-end',
    gap: 1,
  },
  markedAmount: {
    ...typography.amount,
    color: colors.ink,
  },
  mutedAmount: {
    color: colors.textMutedB,
  },
  markedStatus: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.chipBg,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  chipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedC,
  },
  chipValue: {
    fontFamily: fontFamily.extraBold,
  },
  error: {
    ...typography.body,
    color: colors.warningDark,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginTop: 12,
  },
});
