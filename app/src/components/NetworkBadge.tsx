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
  const isWeak = mode === 'WEAK' && !forcedOffline;

  // Calm child-safe badge - offline learning is a normal state, not an error
  const badgeStyle = isOnline
    ? styles.onlineBadge
    : isWeak
    ? styles.weakBadge
    : styles.offlineBadge;

  const dotStyle = isOnline
    ? styles.onlineDot
    : isWeak
    ? styles.weakDot
    : styles.offlineDot;

  const labelText = isOnline
    ? 'Online'
    : isWeak
    ? 'Weak connection'
    : 'Offline learning ready';

  return (
    <View style={[styles.container, badgeStyle]} accessibilityLabel={`Network status: ${labelText}`}>
      <View style={[styles.dot, dotStyle]} />
      <Text style={styles.text}>{labelText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
  },
  onlineBadge: {
    backgroundColor: '#064e3b',
  },
  onlineDot: {
    backgroundColor: colors.primaryLight,
  },
  weakBadge: {
    backgroundColor: '#78350f',
  },
  weakDot: {
    backgroundColor: colors.attentionLight,
  },
  offlineBadge: {
    backgroundColor: '#1e293b',
  },
  offlineDot: {
    backgroundColor: '#94a3b8',
  },
});
