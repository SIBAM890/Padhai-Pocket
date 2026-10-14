import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, Easing, Platform } from 'react-native';

const isNative = Platform.OS !== 'web';

interface SplashScreenProps {
  onReady?: () => void;
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onReady, onComplete }) => {
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(8)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;

  const signal1Opacity = useRef(new Animated.Value(0)).current;
  const signal2Opacity = useRef(new Animated.Value(0)).current;
  const signal3Opacity = useRef(new Animated.Value(0)).current;

  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressTextOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Continuous Floating loop for logo: 0 -> -4 -> 0 over 2000ms
    const floatingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: isNative,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: isNative,
        }),
      ])
    );
    floatingLoop.start();

    // 2. Timed choreographed sequence
    // t=0.0s: Logo opacity 0->1, scale 0.9->1.0 (400ms, ease-out)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: isNative,
      }),
      Animated.timing(logoScale, {
        toValue: 1.0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: isNative,
      }),
    ]).start();

    // t=0.4s: Title opacity 0->1, translateY 8->0 (300ms)
    const timerTitle = setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: isNative,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: isNative,
        }),
      ]).start();
    }, 400);

    // t=0.6s: Tagline opacity 0->1 (300ms)
    const timerTagline = setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: isNative,
      }).start();
    }, 600);

    // t=0.8s: Trust signal 1 (Offline-first)
    const timerSignal1 = setTimeout(() => {
      Animated.timing(signal1Opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: isNative,
      }).start();
    }, 800);

    // t=0.95s: Trust signal 2 (Odia-medium)
    const timerSignal2 = setTimeout(() => {
      Animated.timing(signal2Opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: isNative,
      }).start();
    }, 950);

    // t=1.1s: Trust signal 3 (BSE Class 9 · Motion)
    const timerSignal3 = setTimeout(() => {
      Animated.timing(signal3Opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: isNative,
      }).start();
    }, 1100);

    // t=1.3s: Progress bar starts filling (2000ms, ease-in-out)
    const timerProgress = setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false, // width animation
      }).start();
    }, 1300);

    // t=3.5s: "Opening your learning space…" fades in (300ms)
    const timerText = setTimeout(() => {
      Animated.timing(progressTextOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: isNative,
      }).start();
    }, 3500);

    // t=4.0s: Entire splash fades out (300ms)
    const timerFadeOut = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: isNative,
      }).start();
    }, 4000);

    // t=4.3s: onComplete() fires -> app transitions to onboarding
    const timerDone = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else if (onReady) {
        onReady();
      }
    }, 4300);

    return () => {
      floatingLoop.stop();
      clearTimeout(timerTitle);
      clearTimeout(timerTagline);
      clearTimeout(timerSignal1);
      clearTimeout(timerSignal2);
      clearTimeout(timerSignal3);
      clearTimeout(timerProgress);
      clearTimeout(timerText);
      clearTimeout(timerFadeOut);
      clearTimeout(timerDone);
    };
  }, [
    floatAnim,
    logoOpacity,
    logoScale,
    titleOpacity,
    titleTranslateY,
    taglineOpacity,
    signal1Opacity,
    signal2Opacity,
    signal3Opacity,
    progressAnim,
    progressTextOpacity,
    splashOpacity,
    onComplete,
    onReady,
  ]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: splashOpacity }]}>
      <View style={styles.centerContent}>
        {/* Glow & Floating Logo Container */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoGlow} />
          <Animated.View
            style={[
              styles.logoAnimatedBox,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { translateY: floatAnim }],
              },
            ]}
          >
            <Image
              source={require('../../assets/Padhai_Pocket.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.appTitle,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          PadhAI Pocket
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Learn anywhere. Even offline.
        </Animated.Text>

        {/* Trust Signals Container */}
        <View style={styles.trustSignalsBox}>
          <Animated.View style={[styles.signalRow, { opacity: signal1Opacity }]}>
            <View style={styles.dot} />
            <Text style={styles.signalText}>Offline-first</Text>
          </Animated.View>

          <Animated.View style={[styles.signalRow, { opacity: signal2Opacity }]}>
            <View style={styles.dot} />
            <Text style={styles.signalText}>Odia-medium</Text>
          </Animated.View>

          <Animated.View style={[styles.signalRow, { opacity: signal3Opacity }]}>
            <View style={styles.dot} />
            <Text style={styles.signalText}>BSE Class 9 · Motion</Text>
          </Animated.View>
        </View>

        {/* Horizontal Progress Bar (replaces spinner) */}
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <Animated.Text style={[styles.loadingText, { opacity: progressTextOpacity }]}>
            Opening your learning space…
          </Animated.Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>BSE Odisha · Class 9 Physical Science</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6E3', // cream
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(232, 163, 61, 0.15)', // soft mustard glow
  },
  logoAnimatedBox: {
    width: 160,
    height: 160,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 160,
    height: 160,
    borderRadius: 32,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F4C5C', // teal
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#4A4A4A', // inkSoft
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  trustSignalsBox: {
    marginTop: 28,
    backgroundColor: '#F5EBD0', // creamDark
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 240,
    gap: 8,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C1440E', // terracotta bullet
  },
  signalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A', // ink
    letterSpacing: 0.2,
  },
  progressSection: {
    marginTop: 36,
    alignItems: 'center',
  },
  progressTrack: {
    width: 200,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F5EBD0',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#C1440E', // terracotta
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#4A4A4A', // inkSoft
    marginTop: 12,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#8A8A8A', // inkFaint
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
});
