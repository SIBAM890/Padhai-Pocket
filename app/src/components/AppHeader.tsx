import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, spacing } from '../theme/theme';
import { NetworkBadge } from './NetworkBadge';
import type { NetworkMode } from '../types/events';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  networkMode: NetworkMode;
  forcedOffline?: boolean;
  onHelpPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'PadhAI Pocket',
  subtitle = 'ସୁନୀତାଙ୍କ ପାଠ (Sunita’s Lesson)',
  networkMode,
  forcedOffline,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.right}>
        <NetworkBadge mode={networkMode} forcedOffline={forcedOffline} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  left: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
});
