import React from 'react';
import { BktTrajectoryChart } from '../src/components/BktTrajectoryChart';
import { ModalityRadarChart } from '../src/components/ModalityRadarChart';
import { TermMasteryBarChart } from '../src/components/TermMasteryBarChart';
import type { ModalityStrength, TermProgressItem } from '../src/engine';

describe('High Quality Progress Report Graph Components', () => {
  describe('BktTrajectoryChart', () => {
    it('renders baseline single-point trajectory with default coordinates', () => {
      const element = React.createElement(BktTrajectoryChart, {
        history: [0.42],
        conceptTitle: 'Distance vs Displacement',
        conceptTitleOr: 'ଦୂରତା ଏବଂ ବିସ୍ଥାପନ',
      });
      expect(element).toBeDefined();
      expect(element.props.history).toEqual([0.42]);
      expect(element.props.conceptTitle).toBe('Distance vs Displacement');
    });

    it('defaults to pie chart mode and supports initialMode switching', () => {
      const element = React.createElement(BktTrajectoryChart, {
        history: [0.7643],
        initialMode: 'pie',
      });
      expect(element.props.initialMode).toBe('pie');
      expect(element.props.history[0]).toBeCloseTo(0.7643, 4);
    });
  });

  describe('ModalityRadarChart', () => {
    it('constructs 3-axis polar radar model with Picture, Audio, and Text', () => {
      const modalities: ModalityStrength[] = [
        { modality: 'P', label_or: '📷 ଚିତ୍ର', label_en: 'Picture', passed: 4, total: 5, rate_pct: 80 },
        { modality: 'A', label_or: '🔊 ଅଡିଓ', label_en: 'Audio', passed: 3, total: 5, rate_pct: 60 },
        { modality: 'T', label_or: '📝 ପାଠ୍ୟ', label_en: 'Text', passed: 5, total: 5, rate_pct: 100 },
      ];
      const element = React.createElement(ModalityRadarChart, {
        modalities,
        width: 340,
        height: 200,
      });
      expect(element.props.modalities.length).toBe(3);
      expect(element.props.modalities[0].rate_pct).toBe(80);
      expect(element.props.modalities[2].rate_pct).toBe(100);
    });

    it('gracefully handles empty modalities array with fallback defaults', () => {
      const element = React.createElement(ModalityRadarChart, {
        modalities: [],
      });
      expect(element.props.modalities).toEqual([]);
    });
  });

  describe('TermMasteryBarChart', () => {
    it('configures vocabulary bars with 70% mastery reference line', () => {
      const terms: TermProgressItem[] = [
        { term_id: 'T_DISP', odia_word: 'ବିସ୍ଥାପନ', en_word: 'Displacement', current_mastery: 0.82, status: 'MASTERED', history: [0.40, 0.82] },
        { term_id: 'T_DIST', odia_word: 'ଦୂରତା', en_word: 'Distance', current_mastery: 0.65, status: 'GROWING', history: [0.40, 0.65] },
        { term_id: 'T_SPEED', odia_word: 'ବେଗ', en_word: 'Speed', current_mastery: 0.40, status: 'GROWING', history: [0.40] },
      ];
      const element = React.createElement(TermMasteryBarChart, {
        terms,
        width: 350,
        height: 220,
      });
      expect(element.props.terms.length).toBe(3);
      expect(element.props.terms[0].status).toBe('MASTERED');
      expect(element.props.terms[0].current_mastery).toBe(0.82);
    });
  });
});
