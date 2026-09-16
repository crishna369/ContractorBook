import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { fontFamily, typography } from '../theme/typography';
import type { Site } from '../types/api';

type SitePickerModalProps = {
  visible: boolean;
  sites: Site[];
  currentSiteId?: string | null;
  excludeSiteIds?: Set<string>;
  onSelect: (siteId: string) => void;
  onClose: () => void;
};

export function SitePickerModal({
  visible,
  sites,
  currentSiteId,
  excludeSiteIds,
  onSelect,
  onClose,
}: SitePickerModalProps) {
  const visibleSites = sites.filter((s) => s.id === currentSiteId || !excludeSiteIds?.has(s.id));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.card}>
          <Text style={styles.title}>Choose site</Text>
          {visibleSites.map((s) => (
            <TouchableOpacity key={s.id} style={styles.row} onPress={() => onSelect(s.id)}>
              <Text style={styles.rowLabel}>{s.name}</Text>
            </TouchableOpacity>
          ))}
          {visibleSites.length === 0 && <Text style={styles.empty}>No sites available</Text>}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 16,
    gap: 4,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.ink,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 12,
  },
  rowLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
  },
  empty: {
    ...typography.body,
    color: colors.textMutedA,
    paddingVertical: 8,
  },
});
