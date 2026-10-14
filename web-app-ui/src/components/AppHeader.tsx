import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
  onAvatarPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  greeting = 'Good morning, Learner',
  subgreeting = 'Keep learning, one step at a time.',
  avatar,
  gender,
  networkMode,
  forcedOffline,
  onAvatarPress,
}) => {
  const isMale = gender === 'male' || avatar === 'male';
  const isFemale = gender === 'female' || avatar === 'female';

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subgreeting}>{subgreeting}</Text>
      </View>

      <View style={styles.rightGroup}>
        <NetworkBadge mode={networkMode} forcedOffline={forcedOffline} />
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
  textContainer: {
    flex: 1,
    paddingRight: spacing.sm,
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
    gap: spacing.sm,
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
    ...shadows.subtle,
  },
});
