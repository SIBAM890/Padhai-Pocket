import React, {useCallback, useState} from 'react';
import {Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {listEvents} from '../db/database';
import type {StoredEvent} from '../types/events';

export default function TraceScreen({navigation}: any) {
  const [events, setEvents] = useState<StoredEvent[]>([]);

  const load = useCallback(async () => setEvents(await listEvents(100)), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Decision Trace</Text>
            <Text style={styles.sub}>Rendered from SQLite event rows</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Learn')}><Text style={styles.back}>Learn</Text></Pressable>
        </View>

        {events.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>No events yet. Answer the lesson question first.</Text></View>
        ) : events.map(event => (
          <View key={event.event_id} style={styles.event}>
            <View style={styles.eventTop}>
              <Text style={styles.node}>{event.node}</Text>
              <Text style={styles.status}>{event.sync_status}</Text>
            </View>
            <Text style={styles.action}>{event.action}</Text>
            <Text style={styles.meta}>seq {event.seq} · {event.network_mode} · {event.origin}</Text>
            <Text style={styles.json}>{JSON.stringify(event.output)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#07111f'},
  container: {padding: 20, gap: 12},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  title: {color: '#fff', fontSize: 28, fontWeight: '800'},
  sub: {color: '#91a0b5', marginTop: 4},
  back: {color: '#6ee7b7', fontWeight: '800'},
  empty: {padding: 22, borderRadius: 16, backgroundColor: '#0e1b2d'},
  emptyText: {color: '#d9e2ef', lineHeight: 22},
  event: {backgroundColor: '#0e1b2d', borderRadius: 16, padding: 15},
  eventTop: {flexDirection: 'row', justifyContent: 'space-between'},
  node: {color: '#6ee7b7', fontWeight: '900', fontSize: 12},
  status: {color: '#fbbf24', fontWeight: '800', fontSize: 11},
  action: {color: '#fff', fontSize: 17, fontWeight: '800', marginTop: 8},
  meta: {color: '#91a0b5', marginTop: 5, fontSize: 12},
  json: {color: '#b9c8db', marginTop: 10, fontFamily: 'monospace', fontSize: 12},
});
