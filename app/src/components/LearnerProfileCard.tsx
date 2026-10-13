import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { MaleHumanIcon, FemaleHumanIcon, UserIcon, FlameIcon, BookIcon } from './AppIcons';
import type { LearnerProfile } from '../mock/mockData';

interface LearnerProfileCardProps {
  profile: LearnerProfile;
  onEdit?: () => void;
  onOpenTeacherPin?: () => void;
}

export const LearnerProfileCard: React.FC<LearnerProfileCardProps> = ({
  profile,
  onEdit,
  onOpenTeacherPin,
}) => {
  const isMale = profile.gender === 'male' || profile.avatar === 'male';
  const isFemale = profile.gender === 'female' || profile.avatar === 'female';

  const subjectLabel =
    profile.subject === 'physics'
      ? 'Physical Science (ଭୌତିକ ବିଜ୍ଞାନ)'
      : profile.subject === 'mathematics'
      ? 'Mathematics (ଗଣିତ)'
      : profile.subject === 'science'
      ? 'Life Science (ଜୀବ ବିଜ୍ଞାନ)'
      : profile.subject;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          {isMale ? (
            <MaleHumanIcon size={34} color={colors.primary} />
          ) : isFemale ? (
            <FemaleHumanIcon size={34} color={colors.primary} />
          ) : (
            <UserIcon size={34} color={colors.primary} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.standard}>{profile.standard}</Text>
          <Text style={styles.subject}>{subjectLabel}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <View style={styles.statIconRow}>
            <FlameIcon size={16} color={colors.accent} />
            <Text style={styles.statValue}>{profile.streakDays} Days</Text>
          </View>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile.minutesThisWeek} min</Text>
          <Text style={styles.statLabel}>Study This Week</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statIconRow}>
            <BookIcon size={16} color={colors.primary} />
            <Text style={styles.statValue}>{profile.completedLessons}</Text>
          </View>
          <Text style={styles.statLabel}>Completed Lessons</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>★ {profile.totalPoints}</Text>
          <Text style={styles.statLabel}>Learning Points</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {onEdit && (
          <Pressable
            style={styles.editBtn}
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        )}

        {onOpenTeacherPin && (
          <Pressable
            style={styles.teacherBtn}
            onPress={onOpenTeacherPin}
            accessibilityRole="button"
            accessibilityLabel="Teacher overview"
          >
            <Text style={styles.teacherBtnText}>Teacher Overview (PIN)</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.hero,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  standard: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  subject: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '700',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  editBtnText: {
    ...typography.button,
  },
  teacherBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  teacherBtnText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
