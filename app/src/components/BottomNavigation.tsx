import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

export type MainNavTab = 'Home' | 'Learn' | 'Progress' | 'Profile';

interface BottomNavigationProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenJudgeTools?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenJudgeTools,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, currentTab === 'Home' && styles.activeTab]}
        onPress={() => onSelectTab('Home')}
        accessibilityRole="button"
        accessibilityLabel="Home tab"
      >
        <Text style={styles.icon}>🏠</Text>
        <Text style={[styles.label, currentTab === 'Home' && styles.activeLabel]}>Home</Text>
      </Pressable>

      <Pressable
        style={[styles.tab, currentTab === 'Learn' && styles.activeTab]}
        onPress={() => onSelectTab('Learn')}
        accessibilityRole="button"
        accessibilityLabel="Learn tab"
      >
        <Text style={styles.icon}>📖</Text>
        <Text style={[styles.label, currentTab === 'Learn' && styles.activeLabel]}>Learn</Text>
      </Pressable>

      <Pressable
        style={[styles.tab, currentTab === 'Progress' && styles.activeTab]}
        onPress={() => onSelectTab('Progress')}
        accessibilityRole="button"
        accessibilityLabel="Progress tab"
      >
        <Text style={styles.icon}>📊</Text>
        <Text style={[styles.label, currentTab === 'Progress' && styles.activeLabel]}>Progress</Text>
      </Pressable>

      <Pressable
        style={[styles.tab, currentTab === 'Profile' && styles.activeTab]}
        onPress={() => onSelectTab('Profile')}
        accessibilityRole="button"
        accessibilityLabel="Profile tab"
      >
        <Text style={styles.icon}>👤</Text>
        <Text style={[styles.label, currentTab === 'Profile' && styles.activeLabel]}>Profile</Text>
      </Pressable>

      {/* Discrete judge / developer trigger */}
      {onOpenJudgeTools && (
        <Pressable
          style={styles.judgeTab}
          onPress={onOpenJudgeTools}
          accessibilityRole="button"
          accessibilityLabel="Judge tools"
        >
          <Text style={styles.judgeIcon}>⚙️</Text>
          <Text style={styles.judgeLabel}>Demo</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...shadows.card,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '800',
  },
  judgeTab: {
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    opacity: 0.6,
  },
  judgeIcon: {
    fontSize: 14,
  },
  judgeLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '700',
  },
});
