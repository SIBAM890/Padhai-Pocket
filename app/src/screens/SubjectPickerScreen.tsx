import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Platform,
} from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme/theme';
import {
  BSE_SUBJECTS,
  BseSubject,
  BseChapter,
  BseTopic,
  TopicStatus,
} from '../data/bseSubjects';

interface Props {
  navigation?: any;
  route?: any;
  onSelectTopic?: (topic: BseTopic, subject: BseSubject) => void;
}

export default function SubjectPickerScreen({ navigation, route, onSelectTopic }: Props) {
  const initialSubject = route?.params?.initialSubjectId ?? 'physics';
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubject);
  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const [pendingTopicName, setPendingTopicName] = useState('');

  useEffect(() => {
    if (route?.params?.initialSubjectId) {
      setSelectedSubjectId(route.params.initialSubjectId);
    }
  }, [route?.params?.initialSubjectId]);

  const selectedSubject =
    BSE_SUBJECTS.find((s) => s.id === selectedSubjectId) || BSE_SUBJECTS[0];

  const handleTopicPress = (topic: BseTopic, subject: BseSubject) => {
    if (!topic.ready) {
      setPendingTopicName(topic.titleOr);
      setPendingModalVisible(true);
      return;
    }

    if (onSelectTopic) {
      onSelectTopic(topic, subject);
    } else if (navigation) {
      navigation.navigate('Learn', {
        profileId: 'prof_demo_01',
        subject: subject.id,
        chunkId: topic.chunkId ?? 'motion_01',
        conceptId: topic.conceptId,
        subjectId: subject.id,
        topicId: topic.id,
        navTimestamp: Date.now(),
      });
    }
  };

  const getBadgeStyle = (status: TopicStatus) => {
    switch (status) {
      case 'Full lesson ready':
        return {
          bg: '#DCFCE7',
          border: '#22C55E',
          text: '#166534',
        };
      case 'Preview':
        return {
          bg: '#FEF3C7',
          border: '#F59E0B',
          text: '#92400E',
        };
      case 'Structure ready':
      case 'Pack pending':
      default:
        return {
          bg: '#F1F5F9',
          border: '#CBD5E1',
          text: '#64748B',
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top bar with back button */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.navigate?.('Learn', { subject: selectedSubjectId, subjectId: selectedSubjectId })}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← ଶିକ୍ଷଣ ପୃଷ୍ଠା (Back to Learn)</Text>
          </TouchableOpacity>
          <View style={styles.boardBadge}>
            <Text style={styles.boardBadgeText}>BSE ODISHA • ୯ମ ଶ୍ରେଣୀ</Text>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ବିଷୟ ଚୟନ</Text>
          <Text style={styles.subtitle}>
            BSE Odisha Class 9 Curriculum • ଚୟନ କରନ୍ତୁ ଏବଂ ଅଭ୍ୟାସ ଆରମ୍ଭ କରନ୍ତୁ
          </Text>
        </View>

        {/* 4-Tile Grid for Subjects */}
        <View style={styles.grid}>
          {BSE_SUBJECTS.map((subject) => {
            const isSelected = subject.id === selectedSubjectId;
            const badge = getBadgeStyle(subject.status);

            return (
              <TouchableOpacity
                key={subject.id}
                style={[
                  styles.subjectCard,
                  isSelected && styles.subjectCardSelected,
                ]}
                onPress={() => setSelectedSubjectId(subject.id)}
                activeOpacity={0.85}
              >
                <View style={styles.subjectTopRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: subject.accentColor + '20' },
                    ]}
                  >
                    <Text style={styles.iconText}>{subject.icon}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[styles.statusPillText, { color: badge.text }]}>
                      {subject.statusOr}
                    </Text>
                  </View>
                </View>

                <Text style={styles.subjectTitleOr}>{subject.titleOr}</Text>
                <Text style={styles.subjectTitleEn}>{subject.title}</Text>

                <View style={styles.chapterCountRow}>
                  <Text style={styles.chapterCountText}>
                    {subject.chapters.length} ଅଧ୍ୟାୟ • {subject.readyTopics}/{subject.totalTopics} ପ୍ରସ୍ତୁତ
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Chapter Tree Drill-Down Section */}
        <View style={styles.detailSection}>
          <View style={styles.detailHeader}>
            <View style={styles.detailTitleRow}>
              <Text style={styles.detailIcon}>{selectedSubject.icon}</Text>
              <Text style={styles.detailTitle}>
                {selectedSubject.titleOr} ({selectedSubject.title})
              </Text>
            </View>
            <Text style={styles.detailSubtitle}>
              ନିମ୍ନଲିଖିତ ଅଧ୍ୟାୟରୁ ପାଠ ବାଛି ଅଭ୍ୟାସ କରନ୍ତୁ:
            </Text>
          </View>

          {selectedSubject.id === 'physics' && (
            <TouchableOpacity
              style={styles.jugaadSubjectBanner}
              onPress={() => {
                if (navigation) {
                  navigation.navigate('Learn', {
                    openJugaadLab: true,
                    subject: 'physics',
                    navTimestamp: Date.now(),
                  });
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.jugaadBannerHeader}>
                <View style={styles.jugaadBannerBadge}>
                  <Text style={styles.jugaadBannerBadgeText}>0% INTERNET · REAL HARDWARE SENSORS</Text>
                </View>
                <Text style={styles.jugaadBannerArrow}>➔</Text>
              </View>
              <Text style={styles.jugaadBannerTitle}>
                🔬 ପକେଟ୍ ଜୁଗାଡ଼ ଲ୍ୟାବ୍ (Pocket Jugaad Sensor Lab)
              </Text>
              <Text style={styles.jugaadBannerSub}>
                ପଥର, ସୂତା, ପଟା ଓ ଶବ୍ଦ ମାଧ୍ୟମରେ ସେନ୍ସର ପରୀକ୍ଷା (Motion Ramp · Pendulum g · Sound Echo)
              </Text>
            </TouchableOpacity>
          )}

          {selectedSubject.chapters.map((chapter) => (
            <View key={chapter.id} style={styles.chapterBox}>
              <View style={styles.chapterHeader}>
                <View style={styles.chapterNumberCircle}>
                  <Text style={styles.chapterNumberText}>
                    {chapter.chapterNumber}
                  </Text>
                </View>
                <View style={styles.chapterHeaderTextCol}>
                  <Text style={styles.chapterTitleOr}>
                    ଅଧ୍ୟାୟ {chapter.chapterNumber}: {chapter.titleOr}
                  </Text>
                  <Text style={styles.chapterTitleEn}>{chapter.title}</Text>
                </View>
              </View>

              <View style={styles.topicList}>
                {chapter.topics.map((topic) => {
                  const badge = getBadgeStyle(topic.status);

                  return (
                    <TouchableOpacity
                      key={topic.id}
                      style={[
                        styles.topicRow,
                        !topic.ready && styles.topicRowDisabled,
                      ]}
                      onPress={() => handleTopicPress(topic, selectedSubject)}
                      activeOpacity={topic.ready ? 0.75 : 0.9}
                    >
                      <View style={styles.topicInfoCol}>
                        <View style={styles.topicTitleRow}>
                          <Text style={styles.topicBullet}>
                            {topic.ready ? '●' : '○'}
                          </Text>
                          <Text
                            style={[
                              styles.topicTitleOr,
                              !topic.ready && styles.topicTitleDisabled,
                            ]}
                          >
                            {topic.titleOr}
                          </Text>
                        </View>
                        <Text style={styles.topicTitleEn}>{topic.title}</Text>
                      </View>

                      <View style={styles.topicActionCol}>
                        <View
                          style={[
                            styles.topicStatusBadge,
                            {
                              backgroundColor: badge.bg,
                              borderColor: badge.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.topicStatusText,
                              { color: badge.text },
                            ]}
                          >
                            {topic.statusOr}
                          </Text>
                        </View>
                        {topic.ready ? (
                          <View style={styles.startPill}>
                            <Text style={styles.startPillText}>ଆରମ୍ଭ ▶</Text>
                          </View>
                        ) : (
                          <Text style={styles.lockIcon}>🔒</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Friendly Pending Approval Modal */}
      <Modal
        visible={pendingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIconText}>📖</Text>
            </View>
            <Text style={styles.modalTitle}>ଶିକ୍ଷଣ ପ୍ୟାକ୍ ସୂଚନା</Text>
            <Text style={styles.modalMessage}>
              ଶିକ୍ଷକଙ୍କ ଅନୁମୋଦନ ଅପେକ୍ଷାରେ ଅଛି (Pack pending teacher approval)
            </Text>
            {pendingTopicName ? (
              <Text style={styles.modalTopicNote}>
                ବିଷୟ: {pendingTopicName}
              </Text>
            ) : null}
            <Text style={styles.modalSubMessage}>
              ଏହି ପାଠଟି ଖୁବ ଶୀଘ୍ର ଉପଲବ୍ଧ ହେବ। ବର୍ତ୍ତମାନ ଭୌତିକ ବିଜ୍ଞାନ {'"'}ଦୂରତା ଓ ବିସ୍ଥାପନ{'"'} ଅଭ୍ୟାସ କରନ୍ତୁ।
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setPendingModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>ଠିକ୍ ଅଛି (Got it)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  boardBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  boardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  subjectCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.card,
  },
  subjectCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.01 }],
  },
  subjectTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subjectTitleOr: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subjectTitleEn: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chapterCountRow: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: spacing.xs + 2,
  },
  chapterCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  detailSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  detailHeader: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    paddingBottom: spacing.sm,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  detailSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chapterBox: {
    marginBottom: spacing.lg,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chapterNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  chapterHeaderTextCol: {
    flex: 1,
  },
  chapterTitleOr: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chapterTitleEn: {
    fontSize: 12,
    color: colors.textMuted,
  },
  topicList: {
    gap: spacing.sm,
    paddingLeft: spacing.md,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md - 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicRowDisabled: {
    opacity: 0.8,
    backgroundColor: '#F8FAFC',
  },
  topicInfoCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  topicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginBottom: 2,
  },
  topicBullet: {
    fontSize: 10,
    color: colors.primary,
  },
  topicTitleOr: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  topicTitleDisabled: {
    color: colors.textMuted,
  },
  topicTitleEn: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 14,
  },
  topicActionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topicStatusBadge: {
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  topicStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  startPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.button,
  },
  startPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  lockIcon: {
    fontSize: 14,
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalIconText: {
    fontSize: 26,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.attention,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalTopicNote: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  modalSubMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  jugaadSubjectBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  jugaadBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  jugaadBannerBadge: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  jugaadBannerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  jugaadBannerArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  jugaadBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  jugaadBannerSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
