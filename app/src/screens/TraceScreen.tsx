import React, { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme/theme';
import { TraceTimeline } from '../components/TraceTimeline';
import { BottomNavigation } from '../components/BottomNavigation';
import { mockTraceEvents } from '../mock/mockData';
import { listEvents } from '../db/database';
import type { StoredEvent } from '../types/events';

export default function TraceScreen({ navigation }: any) {
  const [events, setEvents] = useState<any[]>(mockTraceEvents);

  const load = useCallback(async () => {
    try {
      const dbRows = await listEvents(100);
      if (dbRows && dbRows.length > 0) {
        // Map SQLite rows to TraceTimeline format
        const mapped = dbRows.map((row: StoredEvent, index: number) => ({
          id: row.event_id,
          node: row.node,
          action: row.action,
          description: `Action: ${row.action} (seq ${row.seq})`,
          timestamp: new Date(row.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: row.sync_status,
          seq: row.seq,
          payload: row.output ?? {},
        }));
        setEvents(mapped);
      }
    } catch {
      // Fallback cleanly to mock trace events if SQLite is empty
      setEvents(mockTraceEvents);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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

        <TraceTimeline
          episodeId="Episode #001 · BSE9-PHYS-MOTION-S02"
          summaryTitle="State Machine: OBSERVE ➔ MASTERY ➔ PROBE ➔ REFLECT ➔ ACT"
          events={events}
        />
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
