import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/theme';

interface SplashScreenProps {
  onReady?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = () => {
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>

        <Text style={styles.appTitle}>PadhAI Pocket</Text>
        <Text style={styles.tagline}>Learn anywhere. Even without internet.</Text>

        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Opening your learning space…</Text>
        </View>
      </View>

      <Text style={styles.footerText}>BSE Odisha · Class 9 Physical Science</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    fontSize: 36,
  },
  appTitle: {
    ...typography.appTitle,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  tagline: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 260,
  },
  loaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
