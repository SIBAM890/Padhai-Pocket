import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';
import { mockTeacherData } from '../mock/mockData';
import { MaleHumanIcon, FemaleHumanIcon } from './AppIcons';

interface TeacherDashboardModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  visible,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!visible) return null;

  const handleClose = () => {
    setPin('');
    setIsAuthenticated(false);
    setErrorMessage(null);
    onClose();
  };

  const handlePinSubmit = () => {
    if (pin.trim() === '1234') {
      setIsAuthenticated(true);
      setErrorMessage(null);
      setPin('');
    } else {
      setErrorMessage('Incorrect PIN. Please enter teacher access code (1234).');
    }
  };

  const { overview, learners } = mockTeacherData;

  // PIN Gate Screen
  if (!isAuthenticated) {
    return (
      <View style={styles.backdrop}>
        <View style={styles.pinCard}>
          <View style={styles.topHeader}>
            <View>
              <Text style={styles.teacherBadge}>TEACHER ACCESS</Text>
              <Text style={styles.title}>Enter Teacher PIN</Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕ Close</Text>
            </Pressable>
          </View>

          <Text style={styles.pinSubtitle}>
            Learner diagnostic cohort data is restricted to teachers and administrators.
          </Text>

          <TextInput
            style={[styles.pinInput, errorMessage ? styles.pinInputError : null]}
            value={pin}
            onChangeText={(val) => {
              setPin(val);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Enter 4-digit PIN (e.g. 1234)"
            placeholderTextColor={colors.textDisabled}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            autoFocus
          />

          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <Pressable
            style={styles.pinSubmitBtn}
            onPress={handlePinSubmit}
            accessibilityRole="button"
          >
            <Text style={styles.pinSubmitBtnText}>Unlock Dashboard ➔</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Authenticated Dashboard
  return (
    <View style={styles.backdrop}>
      <View style={styles.modalCard}>
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.teacherBadge}>TEACHER OVERVIEW (ଶିକ୍ଷକ ଡ୍ୟାସବୋର୍ଡ)</Text>
            <Text style={styles.title}>Multi-Learner Diagnostic Monitor</Text>
          </View>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕ Close</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Overview Metrics Cards */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{overview.activeLearners}</Text>
              <Text style={styles.metricLabel}>Active Learners</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{overview.syncedEpisodes}</Text>
              <Text style={styles.metricLabel}>Episodes Evaluated</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{overview.offlineDevices}</Text>
              <Text style={styles.metricLabel}>Offline Tablets</Text>
            </View>
            <View style={[styles.metricCard, styles.flaggedCard]}>
              <Text style={[styles.metricNumber, styles.flaggedNumber]}>
                {overview.flaggedAssistance}
              </Text>
              <Text style={styles.metricLabel}>Teacher Flags</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Learner Cohort Status</Text>

          {/* Learners List */}
          {learners.map((learner) => (
            <View key={learner.id} style={styles.learnerRow}>
              <View style={styles.learnerInfo}>
                <View style={styles.avatarContainer}>
                  {learner.avatar === '👦🏽' || learner.name.includes('Rohan') ? (
                    <MaleHumanIcon size={20} color={colors.primary} />
                  ) : (
                    <FemaleHumanIcon size={20} color={colors.primary} />
                  )}
                </View>
                <View>
                  <Text style={styles.learnerName}>{learner.name}</Text>
                  <Text style={styles.lastActive}>Active {learner.lastActive}</Text>
                </View>
              </View>

              <View style={styles.masteryColumns}>
                <View style={styles.masteryCol}>
                  <Text style={styles.masteryVal}>
                    {Math.round(learner.conceptMastery * 100)}%
                  </Text>
                  <Text style={styles.masteryCaption}>Concept</Text>
                </View>
                <View style={styles.masteryCol}>
                  <Text style={styles.masteryVal}>
                    {Math.round(learner.termMastery * 100)}%
                  </Text>
                  <Text style={styles.masteryCaption}>Term (T_DISP)</Text>
                </View>
              </View>

              {learner.confirmedGaps.length > 0 && (
                <View style={styles.gapPill}>
                  <Text style={styles.gapText}>
                    Diagnosed gap: {learner.confirmedGaps.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.hero,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  pinCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.hero,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  pinSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginVertical: spacing.md,
    lineHeight: 20,
  },
  pinInput: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  pinInputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pinSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.subtle,
  },
  pinSubmitBtnText: {
    ...typography.button,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  teacherBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flaggedCard: {
    backgroundColor: '#FFF5F4',
    borderColor: '#FECDD3',
  },
  metricNumber: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  flaggedNumber: {
    color: colors.accent,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  learnerRow: {
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  learnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnerName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lastActive: {
    ...typography.caption,
    color: colors.textMuted,
  },
  masteryColumns: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginVertical: spacing.xs,
  },
  masteryCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  masteryVal: {
    ...typography.body,
    fontWeight: '800',
    color: colors.primary,
  },
  masteryCaption: {
    ...typography.caption,
    color: colors.textMuted,
  },
  gapPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF5F4',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginTop: spacing.xs,
  },
  gapText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
});
