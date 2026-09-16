import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner} pointerEvents="none">
      <Text style={styles.text}>No internet connection — changes won't be saved</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 36,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.warningDark,
    alignItems: 'center',
    zIndex: 999,
    elevation: 999,
  },
  text: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
  },
});
