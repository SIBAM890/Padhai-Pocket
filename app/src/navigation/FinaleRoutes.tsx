import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import LearnScreen from '../screens/LearnScreen';
import TraceScreen from '../screens/TraceScreen';
import RawLogScreen from '../screens/RawLogScreen';
import { colors, radius, shadows, spacing, typography } from '../theme/theme';

/**
 * PadhAI Pocket — Central Route Registry (PRD v3.1 Merge 0)
 * 
 * Defines the 6 canonical finale routes:
 * 1. SubjectPicker  (Subject & chapter selection)
 * 2. Learn          (Active learning & interactive exercises)
 * 3. Progress       (Student learning milestones & mastery)
 * 4. TeacherView    (Classroom review & teacher insights)
 * 5. ProfilePicker  (Learner profile switcher)
 * 6. Trace          (Runtime telemetry & event inspector)
 * + RawLog          (Cryptographic event log)
 */
export const FINALE_ROUTES = {
  SubjectPicker: 'SubjectPicker',
  Learn: 'Learn',
  Progress: 'Progress',
  TeacherView: 'TeacherView',
  ProfilePicker: 'ProfilePicker',
  Trace: 'Trace',
  RawLog: 'RawLog',
} as const;

export type FinaleRouteName = (typeof FINALE_ROUTES)[keyof typeof FINALE_ROUTES];

export type FinaleStackParamList = {
  SubjectPicker: { initialSubjectId?: string } | undefined;
  Learn: { profileId?: string; subject?: string; chunkId?: string; subjectId?: string; topicId?: string; conceptId?: string; navTimestamp?: number } | undefined;
  Progress: { profileId?: string } | undefined;
  TeacherView: { profileId?: string } | undefined;
  ProfilePicker: undefined;
  Trace: undefined;
  RawLog: undefined;
};

type ScreenNavProp = NativeStackNavigationProp<FinaleStackParamList>;

interface StubScreenProps {
  navigation: ScreenNavProp;
}

// ============================================================================
// Route 1: SubjectPicker Stub Screen
// ============================================================================
export function SubjectPickerScreen({ navigation }: StubScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>ପାଠ୍ୟକ୍ରମ • CURRICULUM</Text>
        </View>
        <Text style={styles.title}>ବିଷୟ ଚୟନ</Text>
        <Text style={styles.subtitle}>Select your learning subject and chapter</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📚</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>୯ମ ଶ୍ରେଣୀ ଭୌତିକ ବିଜ୍ଞାନ</Text>
              <Text style={styles.cardSubtitle}>Class 9 Physical Science</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            ଅଧ୍ୟାୟ: ଦୂରତା ଓ ବିସ୍ଥାପନ (Distance & Displacement). ମଜାଦାର ଉଦାହରଣ ଏବଂ ଅଭ୍ୟାସ ସହିତ ସହଜରେ ଶିଖନ୍ତୁ।
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Learn', { profileId: 'prof_demo_01', subject: 'physics', chunkId: 'motion_01' })}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>ଶିକ୍ଷଣ ଆରମ୍ଭ କରନ୍ତୁ • Start Learning</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Progress')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>ପ୍ରଗତି ଦେଖନ୍ତୁ • View Progress</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Route 3: Progress Stub Screen
// ============================================================================
export function ProgressScreen({ navigation }: StubScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>ପ୍ରଗତି • LEARNING PROGRESS</Text>
        </View>
        <Text style={styles.title}>ଶିକ୍ଷଣ ପ୍ରଗତି</Text>
        <Text style={styles.subtitle}>Your learning milestones and mastery streaks</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxPrimary]}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>ଦିନ ଲଗାତାର • Day Streak</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxSecondary]}>
            <Text style={styles.statNumber}>86%</Text>
            <Text style={styles.statLabel}>ମାଷ୍ଟରି • Mastery</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>ଉତ୍ସାହଜନକ ଶିକ୍ଷଣ ଯାତ୍ରା</Text>
          <Text style={styles.cardDescription}>
            ନିୟମିତ ଅଭ୍ୟାସ ଦ୍ୱାରା ପ୍ରତ୍ୟେକ ବିଷୟରେ ଦକ୍ଷତା ବୃଦ୍ଧି ପାଉଛି। ଆପଣଙ୍କର ପ୍ରୟାସ ପ୍ରଶଂସନୀୟ!
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Learn')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>ଅଭ୍ୟାସ ଜାରି ରଖନ୍ତୁ • Continue Practice</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Route 4: TeacherView Stub Screen
// ============================================================================
export function TeacherViewScreen({ navigation }: StubScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>ଶିକ୍ଷକ ଦର୍ପଣ • TEACHER DASHBOARD</Text>
        </View>
        <Text style={styles.title}>ଶ୍ରେଣୀଗୃହ ସମୀକ୍ଷା</Text>
        <Text style={styles.subtitle}>Classroom overview and student mastery insights</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: colors.secondaryLight }]}>
              <Text style={styles.iconText}>👩‍🏫</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>ଶିକ୍ଷାର୍ଥୀ ସହାୟତା କେନ୍ଦ୍ର</Text>
              <Text style={styles.cardSubtitle}>Student Support & Guidance</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            ଶ୍ରେଣୀଗୃହର ସମସ୍ତ ଶିକ୍ଷାର୍ଥୀଙ୍କ ଶିକ୍ଷଣ ପ୍ରଗତି ଏବଂ ବ୍ୟକ୍ତିଗତ ପରାମର୍ଶ ପାଇଁ ଶିକ୍ଷକ ପୋର୍ଟାଲ ପ୍ରସ୍ତୁତ।
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Learn')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>ଶିକ୍ଷଣ ପୃଷ୍ଠାକୁ ଫେରନ୍ତୁ • Return to Learn</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Trace')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>ଟେଲିମେଟ୍ରି ପରିଦର୍ଶନ • Inspect Telemetry</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Route 5: ProfilePicker Stub Screen
// ============================================================================
export function ProfilePickerScreen({ navigation }: StubScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>ପ୍ରୋଫାଇଲ • LEARNER PROFILE</Text>
        </View>
        <Text style={styles.title}>ପ୍ରୋଫାଇଲ ଚୟନ</Text>
        <Text style={styles.subtitle}>Select or switch active student profile</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.iconText}>👧</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>ସୁନୀତା (Sunita)</Text>
              <Text style={styles.cardSubtitle}>୯ମ ଶ୍ରେଣୀ • Class 9 Student</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            ପ୍ରୋଫାଇଲ ଆଇଡି: prof_demo_01. ପସନ୍ଦର ଭାଷା: ଓଡ଼ିଆ (Odia) ଏବଂ କୁଇ (Kui) ସହାୟତା।
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Learn')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>ଏହି ପ୍ରୋଫାଇଲ ବାଛନ୍ତୁ • Select Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Central Finale Navigator Wrapper
// ============================================================================
const Stack = createNativeStackNavigator<FinaleStackParamList>();

export interface FinaleNavigatorProps {
  initialRouteName?: keyof FinaleStackParamList;
}

export function FinaleNavigator({ initialRouteName = 'Learn' }: FinaleNavigatorProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SubjectPicker" component={SubjectPickerScreen} />
      <Stack.Screen name="Learn" component={LearnScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="TeacherView" component={TeacherViewScreen} />
      <Stack.Screen name="ProfilePicker" component={ProfilePickerScreen} />
      <Stack.Screen name="Trace" component={TraceScreen} />
      <Stack.Screen name="RawLog" component={RawLogScreen} />
    </Stack.Navigator>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 22,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statBoxPrimary: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  statBoxSecondary: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.button,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
