import React, {useCallback, useState} from 'react';
import {Pressable, SafeAreaView, ScrollView, StyleSheet, Text} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {listEvents} from '../db/database';

export default function RawLogScreen({navigation}: any) {
  const [json, setJson] = useState('Loading…');

  const load = useCallback(async () => {
    const rows = await listEvents(200);
    setJson(JSON.stringify(rows, null, 2));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => navigation.navigate('Learn')}>
          <Text style={styles.back}>← Learn</Text>
        </Pressable>
        <Text style={styles.title}>Raw Log</Text>
        <Text style={styles.sub}>Developer view · local SQLite rows</Text>
        <Text selectable style={styles.code}>{json}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#050a12'},
  container: {padding: 18},
  back: {color: '#6ee7b7', fontWeight: '800', marginBottom: 12},
  title: {color: '#fff', fontSize: 28, fontWeight: '800'},
  sub: {color: '#91a0b5', marginTop: 4, marginBottom: 16},
  code: {color: '#b9c8db', fontFamily: 'monospace', fontSize: 11, lineHeight: 16},
});
