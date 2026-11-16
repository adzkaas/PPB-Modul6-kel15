import { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import {
  Atlas,
  Canvas,
  FilterMode,
  Group,
  MipmapMode,
  Skia,
  rect,
  useRSXformBuffer,
  usePictureAsTexture,
} from "react-native-skia";
import { useIsFocused } from "@react-navigation/native";
import Animated, {
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { tokens } from "../theme/tokens.js";

const { color } = tokens;

const DOT_COUNT = 280;
const HOLE_RADIUS = 76;
const BASE_SPEED = 0.28;
const TEX = 32;

// 3D Double-Helix Torus Vortex particle stream
function createVortexPoints(n) {
  const pts = new Array(n);
  for (let i = 0; i < n; i++) {
    const u = (i / n) * Math.PI * 2 * 3; // 3 spiral turns
    const v = (i / n) * Math.PI * 2;     // main circumference
    const R_major = 0.72; // torus major radius
    const r_minor = 0.36; // tube cross-section radius

    const x = (R_major + r_minor * Math.cos(u)) * Math.cos(v);
    const y = r_minor * Math.sin(u) * 1.35; // elongated vertically
    const z = (R_major + r_minor * Math.cos(u)) * Math.sin(v);

    pts[i] = [x, y, z, u, v];
  }
  return pts;
}

const BASE_PTS = createVortexPoints(DOT_COUNT);

function projectAll(angle, swell, R, cx, cy) {
  const out = new Array(DOT_COUNT);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const tilt = 0.42 + Math.sin(angle * 0.7) * 0.18;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  for (let i = 0; i < DOT_COUNT; i++) {
    const p = BASE_PTS[i];
    const u = p[3];
    const wave = Math.sin(angle * 2.8 + u * 1.5) * 0.1;
    const rr = R * (swell + wave);

    const x1 = p[0] * cosA + p[2] * sinA;
    const z1 = -p[0] * sinA + p[2] * cosA;
    const y1 = p[1] * cosT - z1 * sinT;
    const z2 = p[1] * sinT + z1 * cosT;

    const depth = (z2 + 1) / 2;
    const s = 2.4 / (2.4 - z2);
    const sx = cx + x1 * rr * s;
    const sy = cy + y1 * rr * s;

    const hx = sx - cx;
    const hy = sy - cy;
    const hidden = hx * hx + hy * hy < HOLE_RADIUS * HOLE_RADIUS;
    const sc = (0.16 + 0.18 * depth) * swell;

    out[i] = hidden
      ? [0, 0, -10000, -10000]
      : [sc, 0, sx - (TEX / 2) * sc, sy - (TEX / 2) * sc];
  }
  return out;
}

export function TempOrb({
  tint = color.primary,
  beatKey = 0,
  size = 320,
  dimmed = false,
}) {
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const angleY = useSharedValue(0.6);
  const spinBoost = useSharedValue(0);
  const intensity = useSharedValue(0);
  const dimSV = useSharedValue(dimmed ? 1 : 0);
  const firstBeat = useRef(true);

  // Creative Holographic Gyroscope animations
  const outerRingRotation = useSharedValue(0);
  const midRingRotation = useSharedValue(0);
  const coreBreathe = useSharedValue(1);
  const shockwaveScale = useSharedValue(0.6);
  const shockwaveOpacity = useSharedValue(0);

  const R = (size * 0.82) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Continuous orbital rotations
  useEffect(() => {
    if (!reduceMotion && !dimmed) {
      // Outer ring spins clockwise
      outerRingRotation.value = withRepeat(
        withTiming(360, { duration: 16000, easing: Easing.linear }),
        -1,
        false
      );
      // Mid ring spins counter-clockwise
      midRingRotation.value = withRepeat(
        withTiming(-360, { duration: 10000, easing: Easing.linear }),
        -1,
        false
      );
      // Core breathing pulsation
      coreBreathe.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.94, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [reduceMotion, dimmed, outerRingRotation, midRingRotation, coreBreathe]);

  const dotPicture = useMemo(() => {
    try {
      const recorder = Skia.PictureRecorder();
      const canvas = recorder.beginRecording(rect(0, 0, TEX, TEX));
      const paint = Skia.Paint();
      paint.setAntiAlias(true);
      paint.setColor(Skia.Color("white"));
      canvas.drawCircle(TEX / 2, TEX / 2, TEX / 2 - 1, paint);
      return recorder.finishRecordingAsPicture();
    } catch {
      return null;
    }
  }, []);
  const dotImg = usePictureAsTexture(dotPicture, { width: TEX, height: TEX });

  const sprites = useMemo(
    () => new Array(DOT_COUNT).fill(0).map(() => rect(0, 0, TEX, TEX)),
    []
  );

  // 3D Torus Vortex transforms worklet
  const transforms = useRSXformBuffer(DOT_COUNT, (val, i) => {
    "worklet";
    const p = BASE_PTS[i];
    const a = angleY.value;
    const u = p[3];

    // Harmonic wave ripple
    const ripple = Math.sin(a * 2.8 + u * 1.5) * 0.12 * (1 + 0.4 * intensity.value);
    const swell = 1 + 0.05 * intensity.value + ripple;
    const rr = R * swell;

    // Gyroscopic tumbling
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const tilt = 0.42 + Math.sin(a * 0.7) * 0.18;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    const x1 = p[0] * cosA + p[2] * sinA;
    const z1 = -p[0] * sinA + p[2] * cosA;
    const y1 = p[1] * cosT - z1 * sinT;
    const z2 = p[1] * sinT + z1 * cosT;

    const depth = (z2 + 1) / 2;
    const s = 2.4 / (2.4 - z2);
    const sx = cx + x1 * rr * s;
    const sy = cy + y1 * rr * s;

    // Clearance for center readout
    const hx = sx - cx;
    const hy = sy - cy;
    if (hx * hx + hy * hy < HOLE_RADIUS * HOLE_RADIUS) {
      val.set(0, 0, -10000, -10000);
      return;
    }

    // Depth-based particle scaling
    const sc = (0.16 + 0.18 * depth) * swell;
    val.set(sc, 0, sx - (TEX / 2) * sc, sy - (TEX / 2) * sc);
  });

  useEffect(() => {
    try {
      const initial = projectAll(0.6, 1, R, cx, cy);
      transforms.value = transforms.value.map((slot, i) => {
        slot.set(initial[i][0], initial[i][1], initial[i][2], initial[i][3]);
        return slot;
      });
    } catch {
      // buffer write unsupported fallback
    }
  }, [transforms, R, cx, cy]);

  useEffect(() => {
    dimSV.set(withTiming(dimmed ? 1 : 0, { duration: 400 }));
  }, [dimmed, dimSV]);

  // Reactive shockwave burst on new sensor reading
  useEffect(() => {
    if (firstBeat.current) {
      firstBeat.current = false;
      return;
    }
    if (!beatKey || dimmed || reduceMotion) return;

    // Spin burst and swell
    intensity.set(0);
    intensity.set(
      withSequence(
        withTiming(1.4, { duration: 160 }),
        withTiming(0.4, { duration: 200 }),
        withTiming(0.8, { duration: 140 }),
        withTiming(0, { duration: 320 })
      )
    );
    spinBoost.set(3.6);

    // Shockwave pulse
    shockwaveScale.value = 0.55;
    shockwaveOpacity.value = 0.8;
    shockwaveScale.value = withTiming(1.25, {
      duration: 650,
      easing: Easing.out(Easing.quad),
    });
    shockwaveOpacity.value = withTiming(0, {
      duration: 650,
      easing: Easing.out(Easing.quad),
    });

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // haptics unsupported
    }
  }, [beatKey, dimmed, reduceMotion, intensity, spinBoost, shockwaveScale, shockwaveOpacity]);

  const frame = useFrameCallback((info) => {
    "worklet";
    const dt = Math.min(0.05, (info.timeSincePreviousFrame ?? 16) / 1000);
    spinBoost.value *= Math.pow(0.02, dt);
    angleY.value += dt * (BASE_SPEED + spinBoost.value);
  });

  useEffect(() => {
    frame.setActive(focused && !reduceMotion && !dimmed);
  }, [focused, reduceMotion, dimmed, frame]);

  const groupOpacity = useDerivedValue(() => 0.9 * (1 - 0.55 * dimSV.value));

  // Dual-tone high-tech particle colors (alternating cyan & primary temperature tint)
  const colors = useMemo(() => {
    return Array.from({ length: DOT_COUNT }, (_, i) => {
      return i % 3 === 0 ? "#38BDF8" : tint;
    });
  }, [tint]);

  const animatedOuterRing = useAnimatedStyle(() => ({
    transform: [{ rotate: `${outerRingRotation.value}deg` }],
  }));

  const animatedMidRing = useAnimatedStyle(() => ({
    transform: [{ rotate: `${midRingRotation.value}deg` }],
  }));

  const animatedCoreAura = useAnimatedStyle(() => ({
    transform: [{ scale: coreBreathe.value }],
  }));

  const animatedShockwave = useAnimatedStyle(() => ({
    transform: [{ scale: shockwaveScale.value }],
    opacity: shockwaveOpacity.value,
  }));

  return (
    <View style={[styles.stage, { width: size, height: size }]} accessible={false}>
      {/* 1. Sensor Shockwave Pulse Ring (fires on MQTT message) */}
      <Animated.View
        style={[
          styles.shockwaveRing,
          {
            width: size * 0.9,
            height: size * 0.9,
            borderColor: tint,
          },
          animatedShockwave,
        ]}
      />

      {/* 2. Outer Gyroscope Compass Ring with Orbit Satellites */}
      <Animated.View
        style={[
          styles.outerGyroRing,
          {
            width: size * 0.96,
            height: size * 0.96,
            borderColor: tint,
            opacity: dimmed ? 0.08 : 0.25,
          },
          animatedOuterRing,
        ]}
      >
        <View style={[styles.satelliteMarker, { backgroundColor: tint }]} />
        <View style={[styles.satelliteMarker, styles.satelliteOpposite, { backgroundColor: "#38BDF8" }]} />
      </Animated.View>

      {/* 3. Middle Segmented Counter-Rotating Ring */}
      <Animated.View
        style={[
          styles.midDashedRing,
          {
            width: size * 0.84,
            height: size * 0.84,
            borderColor: "#38BDF8",
            opacity: dimmed ? 0.06 : 0.2,
          },
          animatedMidRing,
        ]}
      />

      {/* 4. Core Pulsing Reactor Aura around Temperature Number */}
      <Animated.View
        style={[
          styles.coreAuraRing,
          {
            width: HOLE_RADIUS * 2 + 20,
            height: HOLE_RADIUS * 2 + 20,
            borderColor: tint,
            backgroundColor: `${tint}10`, // subtle 6% tint fill
            opacity: dimmed ? 0.05 : 0.35,
          },
          animatedCoreAura,
        ]}
      />

      {/* 5. 3D Torus Vortex Particle Stream with Skia */}
      <Canvas style={{ width: size, height: size }}>
        <Group opacity={groupOpacity}>
          <Atlas
            image={dotImg}
            sprites={sprites}
            transforms={transforms}
            colors={colors}
            colorBlendMode="modulate"
            sampling={{ filter: FilterMode.Linear, mipmap: MipmapMode.Linear }}
          />
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  outerGyroRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  satelliteMarker: {
    position: "absolute",
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  satelliteOpposite: {
    top: undefined,
    bottom: -4,
  },
  midDashedRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1.2,
    borderStyle: "dashed",
  },
  coreAuraRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: "solid",
  },
  shockwaveRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: "solid",
  },
});
