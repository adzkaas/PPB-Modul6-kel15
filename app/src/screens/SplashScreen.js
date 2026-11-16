import { useEffect } from "react";
import { StyleSheet, Text, View, Pressable, StatusBar as RNStatusBar } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";

const MEMBERS = [
  { nim: "21120124120026", name: "SANDRIYA RINDY CAHYANI" },
  { nim: "21120124140115", name: "ROSITA SALSABILLA" },
  { nim: "21120124130103", name: "MUHAMMAD FARIS REVANSYAH" },
  { nim: "21120124130045", name: "ABDURRAHMAN ADZKA ASY SYAUQI" },
];

export function SplashScreen({ onFinish }) {
  const pulseScale = useSharedValue(1);
  const ring1Scale = useSharedValue(0.8);
  const ring1Opacity = useSharedValue(0.7);
  const ring2Scale = useSharedValue(0.6);
  const ring2Opacity = useSharedValue(0.5);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Pulse animation icon
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Outer expanding radar wave ring 1
    ring1Scale.value = withRepeat(
      withTiming(1.8, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    ring1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 200 }),
        withTiming(0, { duration: 1600 })
      ),
      -1,
      false
    );

    // Outer expanding radar wave ring 2
    ring2Scale.value = withRepeat(
      withTiming(2.2, { duration: 2200, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    ring2Opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 300 }),
        withTiming(0, { duration: 1900 })
      ),
      -1,
      false
    );

    // Progress bar animation
    progressWidth.value = withTiming(100, {
      duration: 2600,
      easing: Easing.inOut(Easing.quad),
    });

    // Auto-dismiss after 3.0s
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish, pulseScale, ring1Scale, ring1Opacity, ring2Scale, ring2Opacity, progressWidth]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedRing1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const animatedRing2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(350)}
      style={styles.container}
    >
      {/* Top Header with Skip Button */}
      <View style={styles.topBar}>
        <View style={styles.badgePill}>
          <Ionicons name="hardware-chip-outline" size={13} color="#60A5FA" />
          <Text style={styles.badgeText}>IoT Monitor</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
          onPress={onFinish}
          hitSlop={14}
          accessibilityLabel="Lewati Splash Screen"
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>Lewati</Text>
          <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
        </Pressable>
      </View>

      {/* Center Branding & Logo */}
      <View style={styles.centerBlock}>
        <View style={styles.logoStage}>
          <Animated.View style={[styles.haloRing, styles.haloRing2, animatedRing2Style]} />
          <Animated.View style={[styles.haloRing, animatedRing1Style]} />
          <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            <Ionicons name="thermometer" size={44} color="#FFFFFF" />
          </Animated.View>
        </View>

        <Text style={styles.appTitle}>LiveTemp</Text>
        <Text style={styles.appTagline}>
          Real-time IoT Temperature Monitoring System
        </Text>

        {/* Group Info Card with 4 Members */}
        <View style={styles.groupCard}>
          <View style={styles.groupCardHeader}>
            <Ionicons name="people" size={16} color="#60A5FA" />
            <Text style={styles.groupCardTitle}>KELOMPOK 15</Text>
          </View>
          <View style={styles.membersList}>
            {MEMBERS.map((m) => (
              <View key={m.nim} style={styles.memberRow}>
                <Text style={styles.memberNim}>{m.nim}</Text>
                <Text style={styles.memberName} numberOfLines={1}>
                  {m.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Loading Indicator */}
      <View style={styles.bottomBlock}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
        </View>
        <Text style={styles.footerNote}>
          Praktikum Pemrograman Berbasis Bergerak • Modul 6
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#0B1120",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: (RNStatusBar.currentHeight ?? 36) + 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(37, 99, 235, 0.2)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.35)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#93C5FD",
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  skipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#CBD5E1",
  },
  centerBlock: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  logoStage: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 6,
  },
  haloRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(59, 130, 246, 0.35)",
  },
  haloRing2: {
    backgroundColor: "rgba(96, 165, 250, 0.2)",
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 12,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    fontFamily: "monospace",
  },
  appTagline: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 12,
  },
  groupCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 14,
    gap: 10,
  },
  groupCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    paddingBottom: 8,
  },
  groupCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#60A5FA",
    letterSpacing: 0.8,
  },
  membersList: {
    gap: 6,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  memberNim: {
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#38BDF8",
    width: 116,
  },
  memberName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#F1F5F9",
  },
  bottomBlock: {
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  progressBarTrack: {
    width: 160,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  footerNote: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.7,
  },
});
