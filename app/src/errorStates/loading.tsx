import React from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

export interface ErrorStateProps {
  onAction?: () => void;
  actionText?: string;
  title?: string;
  subtitle?: string;
  testID?: string;
}

function getLocalized(key: string, defaultOr: string, defaultEn: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const finale = require('../../../content/strings/finale.or.json');
    if (finale && finale[key]) return { or: finale[key], en: defaultEn };
  } catch {}
  return { or: defaultOr, en: defaultEn };
}

export const LoadingState: React.FC<ErrorStateProps> = ({
  onAction,
  actionText,
  title,
  subtitle,
  testID = 'error-state-loading',
}) => {
  const strings = getLocalized(
    'loading',
    'ଅପେକ୍ଷା କରନ୍ତୁ...',
    'Loading Content'
  );

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>⏳</Text>
        </View>

        <Text style={styles.titleOr}>{title || strings.or}</Text>
        <Text style={styles.titleEn}>{strings.en}</Text>

        <Text style={styles.descOr}>
          ପାଠ୍ୟକ୍ରମ ପ୍ରସ୍ତୁତ ହେଉଛି, ଦୟାକରି କିଛି ସମୟ ଅପେକ୍ଷା କରନ୍ତୁ ।
        </Text>
        <Text style={styles.descEn}>
          {subtitle || 'Your lesson is being prepared. Please wait a moment.'}
        </Text>

        <ActivityIndicator size="large" color={colors.primary} style={styles.indicator} />

        {onAction && (
          <Pressable style={styles.button} onPress={onAction} accessibilityRole="button">
            <Text style={styles.buttonText}>{actionText || 'ଅପେକ୍ଷା କରୁଛି · Please Wait'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  titleOr: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  titleEn: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  descOr: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  descEn: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    maxWidth: 360,
  },
  indicator: {
    marginVertical: spacing.md,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.subtle,
  },
  buttonText: {
    ...typography.button,
  },
});

export const loading = LoadingState;
export default LoadingState;
