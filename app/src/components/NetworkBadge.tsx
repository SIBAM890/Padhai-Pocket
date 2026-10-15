import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';
import type { NetworkMode } from '../types/events';

interface NetworkBadgeProps {
  mode: NetworkMode;
  forcedOffline?: boolean;
}

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({ mode, forcedOffline }) => {
  const isOnline = mode === 'ONLINE' && !forcedOffline;

  return (
    <View style={[styles.container, isOnline ? styles.onlineBox : styles.offlineBox]}>
      <Text style={styles.icon}>{isOnline ? '☁️' : '💾'}</Text>
      <Text style={[styles.label, isOnline ? styles.onlineLabel : styles.offlineLabel]}>
        {isOnline ? 'Online' : 'Saved on device'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: 4,
  },
  onlineBox: {
    backgroundColor: colors.secondaryLight,
  },
  offlineBox: {
    backgroundColor: colors.surfaceSubtle,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
  },
  onlineLabel: {
    color: colors.secondary,
  },
  offlineLabel: {
    color: colors.textMuted,
  },
});
