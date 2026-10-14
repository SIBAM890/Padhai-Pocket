import {
  getTimeOfDayGreeting,
  formatLocalDateKey,
  getIntensityLevel,
  computeStreakData,
} from '../src/utils/streakHelper';
import type { StoredEvent } from '../src/types/events';

describe('Streak & Time-Aware Greeting Logic', () => {
  describe('getTimeOfDayGreeting', () => {
    it('returns "Good morning, ${name}" for hours 5 to 11', () => {
      expect(getTimeOfDayGreeting('Sunita', 5)).toBe('Good morning, Sunita');
      expect(getTimeOfDayGreeting('Sunita', 8)).toBe('Good morning, Sunita');
      expect(getTimeOfDayGreeting('Sunita', 11)).toBe('Good morning, Sunita');
    });

    it('returns "Good afternoon, ${name}" for hours 12 to 16', () => {
      expect(getTimeOfDayGreeting('Sunita', 12)).toBe('Good afternoon, Sunita');
      expect(getTimeOfDayGreeting('Sunita', 14)).toBe('Good afternoon, Sunita');
      expect(getTimeOfDayGreeting('Sunita', 16)).toBe('Good afternoon, Sunita');
    });

    it('returns "Good evening, ${name}" for hours 17 to 20', () => {
      expect(getTimeOfDayGreeting('Sunita', 17)).toBe('Good evening, Sunita');
      expect(getTimeOfDayGreeting('Sunita', 19)).toBe('Good evening, Sunita');
      expect(getTimeOfDayGreeting('Sunita', 20)).toBe('Good evening, Sunita');
    });

    it('returns "Welcome back, ${name}" for hours 21 to 4', () => {
      expect(getTimeOfDayGreeting('Sunita', 21)).toBe('Welcome back, Sunita');
      expect(getTimeOfDayGreeting('Sunita', 23)).toBe('Welcome back, Sunita');
      expect(getTimeOfDayGreeting('Sunita', 0)).toBe('Welcome back, Sunita');
      expect(getTimeOfDayGreeting('Sunita', 4)).toBe('Welcome back, Sunita');
    });

    it('defaults to Sunita when learnerName is missing or empty', () => {
      expect(getTimeOfDayGreeting('', 9)).toBe('Good morning, Sunita');
      expect(getTimeOfDayGreeting(undefined, 13)).toBe('Good afternoon, Sunita');
    });

    it('formats custom name correctly', () => {
      expect(getTimeOfDayGreeting('Sarthak', 9)).toBe('Good morning, Sarthak');
    });
  });

  describe('getIntensityLevel', () => {
    it('maps counts correctly to 4 tiers', () => {
      expect(getIntensityLevel(0)).toBe(0);
      expect(getIntensityLevel(1)).toBe(1);
      expect(getIntensityLevel(2)).toBe(1);
      expect(getIntensityLevel(3)).toBe(2);
      expect(getIntensityLevel(4)).toBe(2);
      expect(getIntensityLevel(5)).toBe(3);
      expect(getIntensityLevel(12)).toBe(3);
    });
  });

  describe('computeStreakData', () => {
    const fixedWednesday = new Date('2026-10-14T12:00:00.000Z');

    it('computes 4 rows x 7 columns rolling calendar matrix', () => {
      const res = computeStreakData([], false, fixedWednesday);
      expect(res.gridData.length).toBe(7); // Mon through Sun

      for (const day of res.gridData) {
        expect(day.levels.length).toBe(4); // 4 rows
        expect(day.cells.length).toBe(4);
      }
    });

    it('strictly forces future days in current week to render as uncolored/future cells', () => {
      const res = computeStreakData([], false, fixedWednesday);
      // Fixed Wednesday: Thu (col 3), Fri (col 4), Sat (col 5), Sun (col 6) in Row 3 (current week) are future!
      const wednesdayCell = res.gridData[2].cells[3];
      expect(wednesdayCell.isToday).toBe(true);
      expect(wednesdayCell.isFuture).toBe(false);

      const thursdayCell = res.gridData[3].cells[3];
      expect(thursdayCell.isFuture).toBe(true);
      expect(thursdayCell.color).toBe('#F8FAFC');

      const sundayCell = res.gridData[6].cells[3];
      expect(sundayCell.isFuture).toBe(true);
      expect(sundayCell.color).toBe('#F8FAFC');
    });

    it('computes dynamic streak, minutes this week, and today goal from real events', () => {
      const todayKey = formatLocalDateKey(fixedWednesday);
      const mockEvents: StoredEvent[] = [
        {
          schema_version: '1.1',
          event_id: 'ev-1',
          profile_id: 'prof_demo_01',
          seq: 1,
          ts: `${todayKey}T08:00:00.000Z`,
          origin: 'device',
          node: 'OBSERVE',
          action: 'OBSERVE_MCQ',
          input_hash: 'e3b0c44298fc',
          output: { correct: true },
          network_mode: 'ONLINE',
          engine_version: '1.0.0',
          pack_hash: 'pack_1',
          sync_status: 'ACKED',
          retry_count: 0,
          next_retry_at: 0,
        },
        {
          schema_version: '1.1',
          event_id: 'ev-2',
          profile_id: 'prof_demo_01',
          seq: 2,
          ts: `${todayKey}T08:05:00.000Z`,
          origin: 'device',
          node: 'PROBE',
          action: 'OBSERVE_CONFIRM_ITEM',
          input_hash: 'e3b0c44298fc',
          output: { term_id: 'T_DISP', correct: true },
          network_mode: 'ONLINE',
          engine_version: '1.0.0',
          pack_hash: 'pack_1',
          sync_status: 'ACKED',
          retry_count: 0,
          next_retry_at: 0,
        },
      ];

      const res = computeStreakData(mockEvents, false, fixedWednesday);
      expect(res.streakDays).toBe(1);
      expect(res.todayActivitiesDone).toBe(2);
      expect(res.minutesThisWeek).toBe(3); // Math.max(1, Math.round(2 * 1.5)) = 3 min
      expect(res.todayCell?.gapType).toBe('term'); // Term bridge prioritized
      expect(res.todayCell?.color).toBe('#0D9488');
      expect(res.todayCell?.badgeLetter).toBe('T');
    });
  });
});
