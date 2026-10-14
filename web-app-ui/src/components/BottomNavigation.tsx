import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { HomeIcon, BookIcon, ChartIcon, UserIcon, SettingsIcon } from './AppIcons';

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
        <HomeIcon
          size={22}
          color={currentTab === 'Home' ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, currentTab === 'Home' && styles.activeLabel]}>Home</Text>
      </Pressable>

      <Pressable
        style={[styles.tab, currentTab === 'Learn' && styles.activeTab]}
        onPress={() => onSelectTab('Learn')}
        accessibilityRole="button"
        accessibilityLabel="Learn tab"
      >
        <BookIcon
          size={22}
          color={currentTab === 'Learn' ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, currentTab === 'Learn' && styles.activeLabel]}>Learn</Text>
      </Pressable>

      <Pressable
        style={[styles.tab, currentTab === 'Progress' && styles.activeTab]}
        onPress={() => onSelectTab('Progress')}
        accessibilityRole="button"
        accessibilityLabel="Progress tab"
      >
        <ChartIcon
          size={22}
          color={currentTab === 'Progress' ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, currentTab === 'Progress' && styles.activeLabel]}>Progress</Text>
      </Pressable>

      <Pressable
        style={[styles.tab, currentTab === 'Profile' && styles.activeTab]}
        onPress={() => onSelectTab('Profile')}
        accessibilityRole="button"
        accessibilityLabel="Profile tab"
      >
        <UserIcon
          size={22}
          color={currentTab === 'Profile' ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, currentTab === 'Profile' && styles.activeLabel]}>Profile</Text>
      </Pressable>

      {/* Discrete judge / developer trigger */}
      {onOpenJudgeTools && (
        <Pressable
          style={styles.judgeTab}
          onPress={onOpenJudgeTools}
          accessibilityRole="button"
          accessibilityLabel="Judge demo tools"
        >
          <SettingsIcon size={18} color={colors.textMuted} />
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...shadows.card,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.card,
    minWidth: 58,
    minHeight: 44,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },
  activeLabel: {
    color: colors.primary,
  },
  judgeTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    minWidth: 44,
    minHeight: 44,
  },
  judgeLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
});
