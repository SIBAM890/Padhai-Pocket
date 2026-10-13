import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
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
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatar}>{profile.avatar}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.standard}>{profile.standard}</Text>
          <Text style={styles.subject}>{profile.subject}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>🔥 {profile.streakDays} Days</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>⏱️ {profile.minutesThisWeek} min</Text>
          <Text style={styles.statLabel}>Study This Week</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>📚 {profile.completedLessons}</Text>
          <Text style={styles.statLabel}>Completed Lessons</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>🌟 {profile.totalPoints}</Text>
          <Text style={styles.statLabel}>Learning Points</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {onEdit && (
          <Pressable style={styles.editBtn} onPress={onEdit}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        )}

        {onOpenTeacherPin && (
          <Pressable style={styles.teacherBtn} onPress={onOpenTeacherPin}>
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
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatar: {
    fontSize: 34,
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
    marginTop: 2,
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
    borderRadius: radius.card,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  editBtnText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  teacherBtn: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  teacherBtnText: {
    ...typography.button,
    color: colors.primary,
  },
});
