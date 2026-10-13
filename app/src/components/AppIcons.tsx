import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { colors } from '../theme/theme';

export interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Standardized SVG Vector Icons (Professional Outline / Filled Style)
 * Ensures 100% cross-platform compatibility across iOS, Android, and Web
 * without relying on external fonts, emojis, or AI illustrations.
 */

// Human Male Icon: Clean outline/filled geometric human figure
export const MaleHumanIcon: React.FC<IconProps> = ({
  size = 28,
  color = colors.textPrimary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path
      d="M5 21C5 16.5817 8.13401 14 12 14C15.866 14 19 16.5817 19 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// Human Female Icon: Clean outline/filled geometric human figure
export const FemaleHumanIcon: React.FC<IconProps> = ({
  size = 28,
  color = colors.textPrimary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path
      d="M6 21C6 16.8 8.7 14 12 14C15.3 14 18 16.8 18 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Subtle hair/dress balance stroke of same weight */}
    <Path
      d="M7.5 9.5C7.5 9.5 8.5 12 12 12C15.5 12 16.5 9.5 16.5 9.5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </Svg>
);

// Generic User / Profile Icon
export const UserIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.textPrimary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path
      d="M6 20C6 16.6863 8.68629 14 12 14C15.3137 14 18 16.6863 18 20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// Home Icon
export const HomeIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.textPrimary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Book / Learn Icon
export const BookIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.textPrimary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20V4H6.5C5.11929 4 4 5.11929 4 6.5V19.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 19.5C4 20.8807 5.11929 22 6.5 22H20V17H6.5C5.11929 17 4 18.1193 4 19.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Chart / Progress Icon
export const ChartIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.textPrimary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 20V10" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M12 20V4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M6 20V14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

// Settings / Demo Gear Icon
export const SettingsIcon: React.FC<IconProps> = ({
  size = 22,
  color = colors.textPrimary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path
      d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L20.08 17.17A2 2 0 0 1 17.25 20L16.9 19.65A1.65 1.65 0 0 0 15.08 19.32A1.65 1.65 0 0 0 14 20.87V21.5A2 2 0 0 1 10 21.5V20.87A1.65 1.65 0 0 0 8.92 19.32A1.65 1.65 0 0 0 7.1 19.65L6.75 20A2 2 0 0 1 3.92 17.17L4.27 16.82A1.65 1.65 0 0 0 4.6 15A1.65 1.65 0 0 0 3.05 13.92H2.5A2 2 0 0 1 2.5 9.92H3.05A1.65 1.65 0 0 0 4.6 8.84A1.65 1.65 0 0 0 4.27 7.02L3.92 6.67A2 2 0 0 1 6.75 3.84L7.1 4.19A1.65 1.65 0 0 0 8.92 4.52A1.65 1.65 0 0 0 10 2.97V2.5A2 2 0 0 1 14 2.5V2.97A1.65 1.65 0 0 0 15.08 4.52A1.65 1.65 0 0 0 16.9 4.19L17.25 3.84A2 2 0 0 1 20.08 6.67L19.73 7.02A1.65 1.65 0 0 0 19.4 8.84A1.65 1.65 0 0 0 20.95 9.92H21.5A2 2 0 0 1 21.5 13.92H20.95A1.65 1.65 0 0 0 19.4 15Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Checkmark Icon
export const CheckIcon: React.FC<IconProps> = ({
  size = 18,
  color = colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Trophy / Achievement Icon
export const TrophyIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 21H16M12 17V21M6 4H18V9C18 12.3137 15.3137 15 12 15C8.68629 15 6 12.3137 6 9V4ZM6 7H3C3 9 4.5 10.5 6 10.8V7ZM18 7H21C21 9 19.5 10.5 18 10.8V7Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Flame / Streak Icon
export const FlameIcon: React.FC<IconProps> = ({
  size = 22,
  color = colors.accent,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.5 14.5C8.5 16.433 10.067 18 12 18C13.933 18 15.5 16.433 15.5 14.5C15.5 12 13 10 12 8C11 10 8.5 12 8.5 14.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 2C6.5 6.5 5 12 5 15.5C5 19.0899 7.91015 22 11.5 22C15.0899 22 19 19.0899 19 15.5C19 9.5 14.5 5.5 12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Backpack / School Icon
export const BackpackIcon: React.FC<IconProps> = ({
  size = 28,
  color = colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6V4C9 2.89543 9.89543 2 11 2H13C14.1046 2 15 2.89543 15 4V6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Rect
      x="5"
      y="6"
      width="14"
      height="15"
      rx="3"
      stroke={color}
      strokeWidth="2"
    />
    <Path d="M9 11H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Audio / Wave Icon
export const AudioWaveIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.secondary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3V21" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M8 7V17" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M16 7V17" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M4 11V13" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M20 11V13" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);
