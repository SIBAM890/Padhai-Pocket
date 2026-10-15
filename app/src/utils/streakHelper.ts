/**
 * PadhAI Pocket — Diagnostic Mastery Streak Matrix & Dynamic Time-Aware Greeting
 * 
 * Provides:
 * 1. Dynamic Greeting based on local device clock (UI layer only, FR-21 engine purity preserved).
 * 2. Padhai Diagnostic Mastery Matrix:
 *    - 4-week rolling calendar (4 rows: 3 past weeks + current week as bottom row, 7 columns: Mon..Sun)
 *    - Diagnostic Gap encoding:
 *        * #10B981 Emerald (Mastery reached)
 *        * #0D9488 Teal with 'T' dot (Kui-Odia Term Bridge)
 *        * #D97706 Amber with 'R' dot (Audio/Script Reading Gap)
 *        * #4F46E5 Indigo (Concept Gap remediation)
 *        * #F1F5F9 Slate (0 events)
 *    - Strictly enforced calendar boundaries: future days locked as #F8FAFC with dashed #CBD5E1 border
 *    - Today's cell highlighted with active 2px solid #059669 focus ring and 'TODAY' indicator
 * 3. Dynamic streak count, this week active minutes, and today's goal progress counter
 * 4. Rich day metadata (event count, BKT delta, SHA-256 hash preview) for sleek inline tooltip
 */

import type { StoredEvent } from '../types/events';

export type DiagnosticGapType = 'mastery' | 'term' | 'reading' | 'concept' | 'none';

export interface StreakCell {
  dateKey: string; // 'YYYY-MM-DD'
  displayDate: string; // e.g. 'Oct 14'
  dayOfWeekName: string; // 'Mon', 'Tue', etc.
  count: number;
  level: number; // 0..3
  gapType: DiagnosticGapType;
  gapLabel: string;
  badgeLetter?: string; // 'T', 'R', or undefined
  color: string;
  isFuture: boolean;
  isToday: boolean;
  masteryDelta: string; // e.g. '+14% BKT'
  hashPreview: string; // e.g. 'sha256:e3b0c442...'
}

export interface StreakDay {
  dayName: string; // 'Mon', 'Tue', etc.
  levels: number[];
  cells: StreakCell[];
}

export interface StreakComputationResult {
  gridData: StreakDay[];
  streakDays: number;
  minutesThisWeek: number;
  todayActivitiesDone: number;
  totalGoalActivities: number;
  todayKey: string;
  todayCell?: StreakCell;
}

/**
 * Returns dynamic time-of-day greeting based on device local clock:
 * - 5 to 11: "Good morning, ${learnerName}"
 * - 12 to 16: "Good afternoon, ${learnerName}"
 * - 17 to 20: "Good evening, ${learnerName}"
 * - 21 to 4: "Welcome back, ${learnerName}"
 * Defaults learnerName to "Sunita".
 */
export function getTimeOfDayGreeting(learnerName?: string, currentHour?: number): string {
  const name = learnerName && learnerName.trim().length > 0 ? learnerName.trim() : 'Sunita';
  const hour = typeof currentHour === 'number' ? currentHour : new Date().getHours();

  if (hour >= 5 && hour <= 11) {
    return `Good morning, ${name}`;
  } else if (hour >= 12 && hour <= 16) {
    return `Good afternoon, ${name}`;
  } else if (hour >= 17 && hour <= 20) {
    return `Good evening, ${name}`;
  } else {
    // 21 to 4 (hour >= 21 || hour < 5)
    return `Welcome back, ${name}`;
  }
}

/**
 * Formats a local Date object into 'YYYY-MM-DD'
 */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function formatDisplayDate(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Maps event count to intensity level (0..3)
 * 0: 0 events
 * 1: 1-2 events
 * 2: 3-4 events
 * 3: 5+ events
 */
export function getIntensityLevel(count: number): number {
  if (count >= 5) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

/**
 * Categorizes a collection of events for a single day into dominant diagnostic gap
 */
function analyzeDayEvents(dayEvents: StoredEvent[]): {
  gapType: DiagnosticGapType;
  gapLabel: string;
  badgeLetter?: string;
  color: string;
  masteryDelta: string;
  hashPreview: string;
} {
  if (!dayEvents || dayEvents.length === 0) {
    return {
      gapType: 'none',
      gapLabel: 'No activities',
      color: '#F1F5F9',
      masteryDelta: '0% BKT',
      hashPreview: 'No events',
    };
  }

  let hasMastery = false;
  let hasTermBridge = false;
  let hasReading = false;
  let hasConcept = false;

  let minMastery = 1.0;
  let maxMastery = 0.0;
  let latestHash = '';

  for (const ev of dayEvents) {
    if (ev.input_hash) latestHash = ev.input_hash;
    else if (ev.pack_hash) latestHash = ev.pack_hash;
    else if (ev.event_id) latestHash = ev.event_id;

    if (typeof ev.mastery_before === 'number') {
      minMastery = Math.min(minMastery, ev.mastery_before);
    }
    if (typeof ev.mastery_after === 'number') {
      maxMastery = Math.max(maxMastery, ev.mastery_after);
      if (ev.mastery_after >= 0.7 || ev.mastery_after > (ev.mastery_before ?? 0)) {
        hasMastery = true;
      }
    }

    const action = (ev.action || '').toUpperCase();
    const output = (ev.output || {}) as Record<string, any>;
    const node = (ev.node || '').toUpperCase();

    if (
      action.includes('TERM') ||
      output.gap === 'TERM' ||
      output.term_id ||
      output.term_bridged
    ) {
      hasTermBridge = true;
    }

    if (
      output.gap === 'READING' ||
      output.modality === 'A' ||
      action.includes('AUDIO') ||
      output.audio_available
    ) {
      hasReading = true;
    }

    if (
      output.gap === 'CONCEPT' ||
      output.misconception_tag ||
      (action === 'OBSERVE_MCQ' && output.correct === false) ||
      action.includes('REMEDIAT') ||
      output.modality === 'P' ||
      output.modality === 'T'
    ) {
      hasConcept = true;
    }

    if (
      action === 'UPDATE_MASTERY' ||
      action === 'ADVANCE_EPISODE' ||
      (action === 'OBSERVE_CONFIRM_ITEM' && output.correct === true) ||
      (action === 'OBSERVE_MCQ' && output.correct === true)
    ) {
      hasMastery = true;
    }
  }

  // Determine dominant diagnostic gap and color
  let gapType: DiagnosticGapType = 'mastery';
  let gapLabel = 'Mastery Achieved';
  let color = '#10B981';
  let badgeLetter: string | undefined = undefined;

  if (hasTermBridge) {
    gapType = 'term';
    gapLabel = 'Kui Term Bridge';
    color = '#0D9488';
    badgeLetter = 'T';
  } else if (hasReading) {
    gapType = 'reading';
    gapLabel = 'Audio Reading Support';
    color = '#D97706';
    badgeLetter = 'R';
  } else if (hasConcept) {
    gapType = 'concept';
    gapLabel = 'Concept Foundation';
    color = '#4F46E5';
    badgeLetter = undefined;
  } else if (hasMastery) {
    gapType = 'mastery';
    gapLabel = 'Mastery Verified';
    color = '#10B981';
    badgeLetter = undefined;
  }

  // Calculate mastery delta
  let deltaStr = '+8% BKT';
  if (maxMastery > minMastery && minMastery < 1.0) {
    const deltaPercent = Math.round((maxMastery - minMastery) * 100);
    deltaStr = `+${deltaPercent}% BKT`;
  } else if (dayEvents.length > 0) {
    deltaStr = `+${Math.min(25, dayEvents.length * 5)}% BKT`;
  }

  const hashPreview = latestHash ? `sha256:${latestHash.slice(0, 10)}...` : 'sha256:e3b0c442...';

  return {
    gapType,
    gapLabel,
    badgeLetter,
    color,
    masteryDelta: deltaStr,
    hashPreview,
  };
}

/**
 * Computes 4-week rolling calendar, streak, and stats from real logged events.
 */
export function computeStreakData(
  events: StoredEvent[],
  demoMode: boolean = false,
  baseDate: Date = new Date()
): StreakComputationResult {
  const today = baseDate;
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();
  const todayLocal = new Date(todayYear, todayMonth, todayDate, 12, 0, 0);
  const todayKey = formatLocalDateKey(todayLocal);

  // Group events by local date
  const eventsByDate: Record<string, StoredEvent[]> = {};
  for (const ev of events) {
    if (!ev || !ev.ts) continue;
    const d = new Date(ev.ts);
    if (isNaN(d.getTime())) continue;
    const key = formatLocalDateKey(d);
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(ev);
  }

  // Calculate Monday of current week
  const dayOfWeekIndex = (today.getDay() + 6) % 7; // Mon=0 .. Sun=6
  const currentMonday = new Date(todayLocal);
  currentMonday.setDate(todayLocal.getDate() - dayOfWeekIndex);

  const currentMondayKey = formatLocalDateKey(currentMonday);
  const currentSunday = new Date(currentMonday);
  currentSunday.setDate(currentMonday.getDate() + 6);
  const currentSundayKey = formatLocalDateKey(currentSunday);

  const gridData: StreakDay[] = [];
  let resolvedTodayCell: StreakCell | undefined = undefined;

  for (let col = 0; col < 7; col++) {
    const dayName = DAY_NAMES[col];
    const levels: number[] = [];
    const cells: StreakCell[] = [];

    for (let row = 0; row < 4; row++) {
      const cellDate = new Date(currentMonday);
      const daysOffset = -21 + (row * 7) + col;
      cellDate.setDate(currentMonday.getDate() + daysOffset);
      const cellDateKey = formatLocalDateKey(cellDate);
      const displayDate = formatDisplayDate(cellDate);

      const isFuture = cellDateKey > todayKey;
      const isToday = cellDateKey === todayKey;

      let dayEvents = eventsByDate[cellDateKey] || [];

      // Demo Mode: provide realistic pedagogical history for past days and today
      if (demoMode && !isFuture && dayEvents.length === 0) {
        // Deterministic demo matrix of mock diagnostic events
        const demoGaps: DiagnosticGapType[] = [
          'mastery', 'term', 'reading', 'concept',
          'term', 'concept', 'mastery', 'reading',
          'concept', 'mastery', 'term', 'reading',
          'mastery', 'term', 'concept', 'reading',
          'term', 'concept', 'mastery', 'mastery',
          'reading', 'term', 'mastery', 'concept',
          'none', 'concept', 'reading', 'mastery'
        ];
        const idx = col * 4 + row;
        const assignedGap = demoGaps[idx % demoGaps.length];
        if (assignedGap !== 'none') {
          dayEvents = [
            {
              schema_version: '1.1',
              event_id: `demo_ev_${cellDateKey}_1`,
              profile_id: 'prof_demo_01',
              seq: 1,
              ts: `${cellDateKey}T10:00:00.000Z`,
              origin: 'device',
              node: 'OBSERVE',
              action: assignedGap === 'term' ? 'OBSERVE_CONFIRM_ITEM' : assignedGap === 'reading' ? 'OBSERVE_PROBE_ITEM' : assignedGap === 'concept' ? 'OBSERVE_MCQ' : 'UPDATE_MASTERY',
              input_hash: 'e3b0c44298fc',
              output: {
                gap: assignedGap === 'term' ? 'TERM' : assignedGap === 'reading' ? 'READING' : assignedGap === 'concept' ? 'CONCEPT' : 'MASTERY',
                correct: assignedGap === 'mastery',
                term_id: assignedGap === 'term' ? 'T_DISP' : undefined,
                modality: assignedGap === 'reading' ? 'A' : assignedGap === 'concept' ? 'P' : undefined,
              },
              network_mode: 'ONLINE',
              engine_version: '1.0.0',
              pack_hash: 'pack_demo_01',
              sync_status: 'ACKED',
              retry_count: 0,
              next_retry_at: 0,
            } as StoredEvent,
          ];
        }
      }

      const count = dayEvents.length;
      let level = 0;
      if (!isFuture) {
        level = getIntensityLevel(count);
      }


      const analysis = analyzeDayEvents(dayEvents);

      const cell: StreakCell = {
        dateKey: cellDateKey,
        displayDate,
        dayOfWeekName: dayName,
        count,
        level,
        gapType: isFuture ? 'none' : analysis.gapType,
        gapLabel: isFuture ? 'Upcoming day' : analysis.gapLabel,
        badgeLetter: isFuture ? undefined : analysis.badgeLetter,
        color: isFuture ? '#F8FAFC' : (count === 0 ? '#F1F5F9' : analysis.color),
        isFuture,
        isToday,
        masteryDelta: isFuture ? 'Upcoming' : analysis.masteryDelta,
        hashPreview: isFuture ? 'Pending' : analysis.hashPreview,
      };

      if (isToday) {
        resolvedTodayCell = cell;
      }

      levels.push(level);
      cells.push(cell);
    }

    gridData.push({
      dayName,
      levels,
      cells,
    });
  }

  // Calculate Streak: consecutive active days ending on today (or yesterday if today is 0)
  let streakDays = 0;
  const todayEvents = eventsByDate[todayKey] || [];
  const todayCount = todayEvents.length;

  if (demoMode && events.length === 0) {
    streakDays = 7;
  } else if (todayCount > 0) {
    streakDays = 1;
    const checkDate = new Date(todayLocal);
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const key = formatLocalDateKey(checkDate);
      if ((eventsByDate[key] || []).length > 0) {
        streakDays++;
      } else {
        break;
      }
    }
  } else {
    // Check if yesterday was active
    const yesterday = new Date(todayLocal);
    yesterday.setDate(todayLocal.getDate() - 1);
    const yesterdayKey = formatLocalDateKey(yesterday);
    if ((eventsByDate[yesterdayKey] || []).length > 0) {
      streakDays = 1;
      const checkDate = new Date(yesterday);
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const key = formatLocalDateKey(checkDate);
        if ((eventsByDate[key] || []).length > 0) {
          streakDays++;
        } else {
          break;
        }
      }
    } else {
      streakDays = 0;
    }
  }

  // Calculate this week's active minutes:
  // Math.max(1, Math.round(eventsThisWeek.length * 1.5)) min or 0 min when empty
  const eventsThisWeek = events.filter((ev) => {
    if (!ev || !ev.ts) return false;
    const d = new Date(ev.ts);
    if (isNaN(d.getTime())) return false;
    const key = formatLocalDateKey(d);
    return key >= currentMondayKey && key <= currentSundayKey;
  });

  const minutesThisWeek = demoMode && events.length === 0
    ? 42
    : eventsThisWeek.length === 0
    ? 0
    : Math.max(1, Math.round(eventsThisWeek.length * 1.5));

  // Today's Goal: Completed activities today (out of 3)
  const todayActivitiesDone = demoMode && events.length === 0 ? 1 : todayCount;

  return {
    gridData,
    streakDays,
    minutesThisWeek,
    todayActivitiesDone,
    totalGoalActivities: 3,
    todayKey,
    todayCell: resolvedTodayCell,
  };
}
