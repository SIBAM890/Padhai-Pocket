import React, { useState, useCallback } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, typography, spacing, radius, shadows } from '../theme/theme';

export interface Profile {
  id: string;
  alias?: string;
}

export interface ProfilePickerScreenProps {
  profiles: Profile[];
  activeProfileId: string;
  onSelect: (profileId: string) => void;
  onAdd: (newProfileId: string) => void;
  onDelete: (profileId: string) => void;
}

// 8 fixed avatar emoji (no photos, PRD compliant)
const AVATARS = [
  '🐯', // Tiger
  '🦚', // Peacock
  '🪷', // Lotus
  '🐘', // Elephant
  '🌳', // Banyan
  '🪔', // Lamp
  '🦋', // Butterfly
  '🌾', // Paddy
];

/**
 * Generates a pseudonymous profile ID - exported for testability.
 * Format: prof_ + 8 hex chars (from crypto.randomUUID or Math.random fallback).
 * Length between 12 and 16 characters.
 */
export function generateProfileId(): string {
  try {
    if (
      typeof globalThis !== 'undefined' &&
      globalThis.crypto &&
      typeof globalThis.crypto.randomUUID === 'function'
    ) {
      const uuid = globalThis.crypto.randomUUID().replace(/-/g, '');
      return `prof_${uuid.slice(0, 8)}`;
    }
  } catch {
    // Fallback below
  }
  const hex = Math.random().toString(16).slice(2, 10);
  return `prof_${hex}`;
}

/**
 * Profile picker screen - displays avatar grid with add/delete functionality.
 * Pure presentation & local state. Zero direct database writes.
 */
export function ProfilePickerScreen({
  profiles = [],
  activeProfileId,
  onSelect,
  onAdd,
  onDelete,
}: ProfilePickerScreenProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    const newId = generateProfileId();
    if (typeof onAdd === 'function') {
      onAdd(newId);
    }
  }, [onAdd]);

  const handleDelete = useCallback((id: string) => {
    setShowDeleteConfirm(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (showDeleteConfirm && typeof onDelete === 'function') {
      onDelete(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  }, [showDeleteConfirm, onDelete]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(null);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Learner</Text>
          <Text style={styles.subtitle}>Tap to switch · Add or remove learners</Text>
        </View>

        {/* Avatar Grid */}
        <View style={styles.grid}>
          {profiles.map((profile, index) => {
            const avatar = AVATARS[index % AVATARS.length];
            const isActive = profile.id === activeProfileId;

            return (
              <Pressable
                key={profile.id}
                style={[
                  styles.profileCard,
                  isActive && styles.profileCardActive,
                ]}
                onPress={() => onSelect && onSelect(profile.id)}
              >
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{avatar}</Text>
                  {isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.profileName,
                    isActive && styles.profileNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {profile.alias || profile.id}
                </Text>
                {!isActive && (
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(profile.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                )}
              </Pressable>
            );
          })}

          {/* Add Learner Card */}
          <Pressable
            style={styles.addCard}
            onPress={handleAdd}
          >
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>Add Learner</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={cancelDelete}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Delete Learner?</Text>
                <Pressable
                  onPress={cancelDelete}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              </View>
              <Text style={styles.modalBody}>
                Are you sure you want to delete this learner?
                This action cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelButton} onPress={cancelDelete}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.deleteButtonModal, styles.deleteButtonModalDanger]}
                  onPress={confirmDelete}
                >
                  <Text style={styles.deleteButtonModalText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  profileCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  profileCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.card,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 48,
  },
  activeBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textOnPrimary,
  },
  profileName: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  profileNameActive: {
    color: colors.primary,
  },
  deleteButton: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.errorLight,
    borderRadius: radius.button,
  },
  deleteButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.error,
  },
  addCard: {
    width: '48%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    ...shadows.subtle,
  },
  addIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
    color: colors.primary,
  },
  addText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surface,
    width: '100%',
    maxWidth: 400,
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.hover,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '700',
  },
  modalBody: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  deleteButtonModal: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  deleteButtonModalDanger: {
    backgroundColor: colors.error,
  },
  deleteButtonModalText: {
    fontSize: typography.button.fontSize,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
});