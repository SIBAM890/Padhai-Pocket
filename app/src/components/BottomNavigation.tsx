import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

export type TabKey = 'Learn' | 'Trace' | 'RawLog';

interface BottomNavigationProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  pendingCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  pendingCount = 0,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, currentTab === 'Learn' && styles.activeTab]}
        onPress={() => onSelectTab('Learn')}
        accessibilityRole="button"
        accessibilityLabel="Learn Screen"
      >
        <Text style={styles.icon}>📖</Text>
        <Text style={[styles.label, currentTab === 'Learn' && styles.activeLabel]}>Learn</Text>
      </Pressable>

      <Pressable
        style={[styles.tab, currentTab === 'Trace' && styles.activeTab]}
        onPress={() => onSelectTab('Trace')}
        accessibilityRole="button"
        accessibilityLabel="Trace Screen"
      >
        <Text style={styles.icon}>🔍</Text>
        <Text style={[styles.label, currentTab === 'Trace' && styles.activeLabel]}>Trace</Text>
      </Pressable>

      <Pressable
        style={[styles.tab, currentTab === 'RawLog' && styles.activeTab]}
        onPress={() => onSelectTab('RawLog')}
        accessibilityRole="button"
        accessibilityLabel="Raw Log Screen"
      >
        <View style={styles.badgeWrapper}>
          <Text style={styles.icon}>📋</Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.label, currentTab === 'RawLog' && styles.activeLabel]}>Raw Log</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  activeTab: {
    backgroundColor: colors.surfaceElevated,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  activeLabel: {
    color: colors.primaryLight,
    fontWeight: '800',
  },
  badgeWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.attention,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#07111f',
    fontSize: 10,
    fontWeight: '800',
  },
});
