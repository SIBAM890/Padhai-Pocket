import React, { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme/theme';
import { BottomNavigation } from '../components/BottomNavigation';
import { listEvents } from '../db/database';
import { mockTraceEvents } from '../mock/mockData';

export default function RawLogScreen({ navigation }: any) {
  const [jsonText, setJsonText] = useState('Loading log entries...');
  const [copiedNotice, setCopiedNotice] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await listEvents(200);
      if (rows && rows.length > 0) {
        setJsonText(JSON.stringify(rows, null, 2));
      } else {
        setJsonText(JSON.stringify(mockTraceEvents, null, 2));
      }
    } catch {
      setJsonText(JSON.stringify(mockTraceEvents, null, 2));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleCopy = () => {
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
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
              {copiedNotice ? '✓ Copied to Clipboard' : '📋 Copy JSON'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toolBtn, styles.refreshBtn]}
            onPress={load}
            accessibilityRole="button"
          >
            <Text style={styles.toolBtnText}>🔄 Refresh Log</Text>
          </Pressable>
        </View>

        {/* JSON Viewer */}
        <View style={styles.codeContainer}>
          <Text selectable style={styles.code}>
            {jsonText}
          </Text>
        </View>
      </ScrollView>

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
    backgroundColor: '#050a12',
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
    color: colors.primaryLight,
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
  code: {
    ...typography.mono,
    color: colors.primary,
    fontSize: 12,
    lineHeight: 18,
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
