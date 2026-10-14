import React, { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme/theme';
import { listEvents, subscribeDatabase } from '../db/database';

export default function RawLogScreen({ navigation }: any) {
  const [jsonText, setJsonText] = useState('Loading log entries...');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsError(false);
      const rows = await listEvents(200);
      setJsonText(JSON.stringify(rows ?? [], null, 2));
    } catch {
      setIsError(true);
      setJsonText('[]');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  React.useEffect(() => {
    load();
    const unsub = subscribeDatabase(() => {
      load();
    });
    return unsub;
  }, [load]);

  const handleCopy = async () => {
    try {
      // Cross-platform clipboard support: web/navigator fallback (expo-clipboard omitted to prevent native Metro missing module resolution)
      let copied = false;
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonText);
        copied = true;
      }

      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2000);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>DEVELOPER / AUDIT LOG</Text>
          <Text style={styles.title}>Raw Event Log</Text>
          <Text style={styles.subtitle}>
            Direct schema verification for OpenAPI & event.schema.json
          </Text>
        </View>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <Pressable style={styles.toolBtn} onPress={handleCopy} accessibilityRole="button">
            <Text style={styles.toolBtnText}>
              {copiedNotice ? '✓ Copied to Clipboard' : 'Copy JSON'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toolBtn, styles.refreshBtn]}
            onPress={load}
            accessibilityRole="button"
          >
            <Text style={styles.toolBtnText}>Refresh</Text>
          </Pressable>
        </View>

        {/* Code display card in light palette */}
        <View style={[styles.codeContainer, isError && styles.codeContainerError]}>
          <Text selectable style={[styles.code, isError && styles.codeError]}>
            {jsonText}
          </Text>
        </View>
      </ScrollView>

      {/* Navigation footer */}
      <View style={styles.navBar}>
        <Pressable
          style={styles.navBtn}
          onPress={() => navigation.navigate('Learn')}
        >
          <Text style={styles.navBtnText}>← Back to Learning Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md + 2,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  kicker: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 4,
  },
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toolBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshBtn: {
    backgroundColor: '#F1F5F9',
  },
  toolBtnText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  codeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeContainerError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  code: {
    ...typography.mono,
    color: colors.primary,
    fontSize: 12,
    lineHeight: 18,
  },
  codeError: {
    color: colors.error,
  },
  navBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
  },
  navBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  navBtnText: {
    ...typography.button,
    fontSize: 14,
  },
});
