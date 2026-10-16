import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { NetworkBadge } from './NetworkBadge';
import { MaleHumanIcon, FemaleHumanIcon, UserIcon } from './AppIcons';
import type { NetworkMode } from '../types/events';

interface AppHeaderProps {
  greeting?: string;
  subgreeting?: string;
  avatar?: string;
  gender?: 'male' | 'female';
  networkMode: NetworkMode;
  forcedOffline?: boolean;
  supabaseConnected?: boolean;
  onAvatarPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  greeting = 'Good morning, Learner',
  subgreeting = 'Keep learning, one step at a time.',
  avatar,
  gender,
  networkMode,
  forcedOffline,
  supabaseConnected = false,
  onAvatarPress,
}) => {
  const isMale = gender === 'male' || avatar === 'male';
  const isFemale = gender === 'female' || avatar === 'female';

  return (
    <View style={styles.container}>
      <View style={styles.userSection}>
        <Pressable
          style={styles.avatarButton}
          onPress={onAvatarPress}
          accessibilityRole="button"
          accessibilityLabel="Learner profile"
        >
          {isMale ? (
            <MaleHumanIcon size={24} color={colors.primary} />
          ) : isFemale ? (
            <FemaleHumanIcon size={24} color={colors.primary} />
          ) : (
            <UserIcon size={24} color={colors.primary} />
          )}
        </Pressable>
        <View style={styles.textContainer}>
          <Text style={styles.greeting} numberOfLines={1}>{greeting}</Text>
          <Text style={styles.subgreeting} numberOfLines={1}>{subgreeting}</Text>
        </View>
      </View>

      <View style={styles.rightGroup}>
        {supabaseConnected && !forcedOffline && (
          <View style={styles.supabasePill}>
            <Text style={styles.supabaseDot}>●</Text>
            <Text style={styles.supabaseText}>Synced</Text>
          </View>
        )}
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
    paddingHorizontal: spacing.md,
    paddingTop: Platform?.OS === 'android' ? 6 : spacing.xs,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
    ...shadows.subtle,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subgreeting: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginRight: Platform?.OS === 'android' ? 8 : 0,
  },
  supabasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginRight: 4,
  },
  supabaseDot: {
    color: '#2E7D32',
    fontSize: 10,
    marginRight: 4,
  },
  supabaseText: {
    ...typography.caption,
    color: '#2E7D32',
    fontWeight: '600',
  },
});
