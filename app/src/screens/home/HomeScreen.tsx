import React from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { ProgressBar, StackedProgressBar } from '../../components/ProgressBar';
import { useMe } from '../../api/hooks/useMe';
import { useDashboard } from '../../api/hooks/useDashboard';
import { supabase } from '../../lib/supabase';
import { formatDateLong, todayIsoDate } from '../../utils/attendance';
import type { AppTabsParamList } from '../../navigation/AppTabs';
import type { SitePosition } from '../../types/api';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HomeMain'>,
  BottomTabScreenProps<AppTabsParamList, 'Home'>
>;

function rupees(value: number): string {
  return Math.round(value).toLocaleString('en-IN');
}

function SiteCard({ site, onPress }: { site: SitePosition; onPress: () => void }) {
  const position = Number(site.position);
  const received = Number(site.received);
  const labourCost = Number(site.labour_cost);
  const expenses = Number(site.expenses);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={styles.siteCard}>
        <View style={styles.siteCardTop}>
          <Text style={styles.siteName}>{site.name}</Text>
          <Text style={[styles.sitePosition, position < 0 && styles.sitePositionNegative]}>
            {position >= 0 ? '+' : '−'}₹{rupees(Math.abs(position))}
          </Text>
        </View>
        <StackedProgressBar
          segments={[
            { value: received, color: colors.accentGreen },
            { value: labourCost, color: colors.warningLight },
            { value: expenses, color: colors.textMutedB },
          ]}
        />
        <View style={styles.siteMetricsRow}>
          <Text style={styles.siteMetric}>Received ₹{rupees(received)}</Text>
          <Text style={styles.siteMetric}>Labour ₹{rupees(labourCost)}</Text>
          <Text style={styles.siteMetric}>Expenses ₹{rupees(expenses)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export function HomeScreen({ navigation }: Props) {
  const { data: me } = useMe();
  const { data: dashboard, isLoading, error, refetch, isRefetching } = useDashboard();

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primaryDark} />
      </View>
    );
  }

  if (error || !dashboard) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Couldn't load your dashboard.</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutLink}>Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cash = Number(dashboard.money_in_hand.cash);
  const bank = Number(dashboard.money_in_hand.bank);
  const { marked, total_active_workers: totalActive, labour_cost: todayLabourCost } = dashboard.today_attendance;
  const leftToMark = Math.max(0, totalActive - marked);
  const attendanceProgress = totalActive > 0 ? marked / totalActive : 0;
  const payableTotal = Number(dashboard.payable_total);
  const receivableTotal = Number(dashboard.receivable_total);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primaryDark} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.businessName}>{me?.business_name ?? ''}</Text>
            <Text style={styles.dateText}>{formatDateLong(todayIsoDate())}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} activeOpacity={0.7} style={styles.avatarButton}>
            <Avatar name={me?.business_name ?? '?'} size={40} />
            <Text style={styles.signOutCaption}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('CashBankLedger')}>
          <Card dark style={styles.moneyCard}>
            <Text style={styles.moneyEyebrow}>Money in hand</Text>
            <Text style={styles.moneyUpdated}>Updated just now</Text>
            <View style={styles.moneyRow}>
              <View style={styles.moneyCol}>
                <Text style={styles.moneyColLabel}>Cash</Text>
                <Text style={styles.moneyColValue}>₹{rupees(cash)}</Text>
              </View>
              <View style={styles.moneyDivider} />
              <View style={styles.moneyCol}>
                <Text style={styles.moneyColLabel}>Bank & UPI</Text>
                <Text style={styles.moneyColValue}>₹{rupees(bank)}</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        <Card style={styles.attendanceCard}>
          <View style={styles.attendanceTopRow}>
            <Text style={styles.attendanceTitle}>Today's attendance</Text>
            {leftToMark > 0 && <Text style={styles.attendanceLeft}>{leftToMark} left</Text>}
          </View>
          <Text style={styles.attendanceBigNumber}>{marked}</Text>
          <Text style={styles.attendanceSub}>of {totalActive} workers marked</Text>
          <ProgressBar value={attendanceProgress} />
          <View style={styles.attendanceFooterRow}>
            <Text style={styles.attendanceLabourCost}>Labour cost so far ₹{rupees(Number(todayLabourCost))}</Text>
            <TouchableOpacity style={styles.markNowPill} onPress={() => navigation.navigate('Attendance')}>
              <Text style={styles.markNowLabel}>Mark now</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.statRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Payable to workers</Text>
            <Text style={styles.statValue}>₹{rupees(payableTotal)}</Text>
            <Text style={styles.statSub}>all-time balance</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Pending from clients</Text>
            <Text style={styles.statValue}>₹{rupees(receivableTotal)}</Text>
            <Text style={styles.statSub}>outstanding bills</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sites</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sites')}>
            <Text style={styles.seeAllLink}>See all {dashboard.sites.length}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sitesList}>
          {dashboard.sites.map((site) => (
            <SiteCard
              key={site.site_id}
              site={site}
              onPress={() =>
                navigation.navigate('Sites', { screen: 'SiteDetail', params: { siteId: site.site_id } })
              }
            />
          ))}
          {dashboard.sites.length === 0 && <EmptyState label="No sites yet" />}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPaper,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bgPaper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    ...typography.body,
    color: colors.warningDark,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 60,
    paddingBottom: 40,
    gap: spacing.cardGap,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  businessName: {
    ...typography.headerLarge,
    color: colors.ink,
  },
  avatarButton: {
    alignItems: 'center',
    gap: 3,
  },
  signOutCaption: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    color: colors.textMutedB,
  },
  signOutLink: {
    ...typography.body,
    color: colors.accentGreen,
    marginTop: 4,
  },
  dateText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textMutedA,
    marginTop: 2,
  },
  moneyCard: {
    gap: 4,
  },
  moneyEyebrow: {
    ...typography.eyebrow,
    color: colors.greenTintLight,
  },
  moneyUpdated: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.greenTintMid,
    marginBottom: 10,
  },
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  moneyCol: {
    flex: 1,
    gap: 4,
  },
  moneyColLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.greenTintMid,
  },
  moneyColValue: {
    ...typography.amountLarge,
    color: colors.white,
  },
  moneyDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 16,
  },
  attendanceCard: {
    gap: 6,
  },
  attendanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  attendanceLeft: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.warningLight,
  },
  attendanceBigNumber: {
    fontFamily: fontFamily.extraBold,
    fontSize: 34,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  attendanceSub: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedA,
    marginTop: -6,
    marginBottom: 4,
  },
  attendanceFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  attendanceLabourCost: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedA,
    flex: 1,
  },
  markNowPill: {
    backgroundColor: colors.greenTintLight,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  markNowLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.accentGreen,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.cardGap,
  },
  statCard: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedA,
  },
  statValue: {
    ...typography.header,
    fontSize: 22,
    color: colors.ink,
  },
  statSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textMutedB,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  seeAllLink: {
    ...typography.bodyStrong,
    fontSize: 14,
    color: colors.accentGreen,
  },
  sitesList: {
    gap: 10,
  },
  siteCard: {
    gap: 10,
    padding: spacing.cardPaddingSmall,
  },
  siteCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  siteName: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  sitePosition: {
    fontFamily: fontFamily.extraBold,
    fontSize: 14,
    color: colors.accentGreen,
    fontVariant: ['tabular-nums'],
  },
  sitePositionNegative: {
    color: colors.warningDark,
  },
  siteMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  siteMetric: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.textMutedA,
  },
});
