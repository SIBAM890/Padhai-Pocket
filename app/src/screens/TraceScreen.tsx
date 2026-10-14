import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme/theme';
import { TraceTimeline } from '../components/TraceTimeline';
import { mockTraceEvents } from '../mock/mockData';
import { listEvents, subscribeDatabase } from '../db/database';
import type { StoredEvent } from '../types/events';

export default function TraceScreen({ navigation }: any) {
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [demoMode, setDemoMode] = useState(false);

  const load = useCallback(async () => {
    try {
      const dbRows = await listEvents(100);
      setEvents(dbRows ?? []);
    } catch {
      setEvents([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    load();
    const unsub = subscribeDatabase(() => {
      load();
    });
    return unsub;
  }, [load]);

  const displayEvents = demoMode
    ? mockTraceEvents
    : events.map((row: StoredEvent) => ({
        id: row.event_id,
        node: row.node,
        action: row.action,
        description: `Action: ${row.action} (seq ${row.seq})`,
        timestamp: new Date(row.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: row.sync_status,
        seq: row.seq,
        payload: row.output ?? {},
      }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>DIAGNOSTIC ENGINE TRACE</Text>
          <Text style={styles.title}>Decision Timeline</Text>
          <Text style={styles.subtitle}>
            Inspecting live SQLite rows & diagnostic state machine transitions
          </Text>
        </View>

        {/* Explicit Demo Mode Toggle */}
        <View style={styles.demoRow}>
          <View>
            <Text style={styles.demoLabel}>Demo Trace Data</Text>
            <Text style={styles.demoSub}>Show mock events for stage demonstration</Text>
          </View>
          <Switch value={demoMode} onValueChange={setDemoMode} />
        </View>

        {!demoMode && events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptySubtitle}>
              Answer a question first to view live engine transitions and SQLite rows.
            </Text>
            <Pressable
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('Learn')}
            >
              <Text style={styles.emptyBtnText}>Go to Lesson</Text>
            </Pressable>
          </View>
        ) : (
          <TraceTimeline
            episodeId="Episode #001 · BSE9-PHYS-MOTION-S02"
            summaryTitle="State Machine: OBSERVE ➔ MASTERY ➔ PROBE ➔ REFLECT ➔ ACT"
            events={displayEvents}
          />
        )}
      </ScrollView>

      <View style={styles.navBar}>
        <Pressable
          style={styles.navBtn}
          onPress={() => navigation.navigate('Learn')}
        >
          <Text style={styles.navBtnText}>← Back to Learning Home</Text>
        </Pressable>
        <Pressable
          style={[styles.navBtn, styles.navBtnSecondary]}
          onPress={() => navigation.navigate('RawLog')}
        >
          <Text style={styles.navBtnSecondaryText}>View Raw Log ➔</Text>
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
    marginBottom: spacing.sm,
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
    marginBottom: spacing.sm,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  demoLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  demoSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.hero,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  emptyBtnText: {
    ...typography.button,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  navBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  navBtnText: {
    ...typography.button,
    fontSize: 14,
  },
  navBtnSecondary: {
    backgroundColor: '#F1F5F9',
  },
  navBtnSecondaryText: {
    ...typography.button,
    color: colors.textPrimary,
    fontSize: 14,
  },
});
