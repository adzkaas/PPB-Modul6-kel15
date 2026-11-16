import { ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { tokens } from "../theme/tokens.js";

const { color, space, radius, shadow } = tokens;

const MEMBERS = [
  {
    nim: "21120124120026",
    name: "SANDRIYA RINDY CAHYANI",
    initials: "SR",
    color: "#2563EB",
  },
  {
    nim: "21120124140115",
    name: "ROSITA SALSABILLA",
    initials: "RS",
    color: "#059669",
  },
  {
    nim: "21120124130103",
    name: "MUHAMMAD FARIS REVANSYAH",
    initials: "MF",
    color: "#D97706",
  },
  {
    nim: "21120124130045",
    name: "ABDURRAHMAN ADZKA ASY SYAUQI",
    initials: "AA",
    color: "#7C3AED",
  },
];

export function ProfileScreen() {
  const reduceMotion = useReducedMotion();

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Header Hero Card */}
        <Animated.View
          entering={
            reduceMotion ? undefined : FadeInDown.duration(tokens.motion.entering)
          }
          style={styles.heroCard}
        >
          <View style={styles.heroIconBox}>
            <Ionicons name="people" size={32} color={color.primary} />
          </View>
          <View style={styles.heroTextWrap}>
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>KELOMPOK 15</Text>
            </View>
            <Text style={styles.heroTitle}>Praktikum PBB</Text>
            <Text style={styles.heroSubtitle}>
              Modul 6
            </Text>
          </View>
        </Animated.View>

        {/* Section: Anggota Kelompok */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Anggota Kelompok</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{MEMBERS.length} Anggota</Text>
          </View>
        </View>

        <View style={styles.membersList}>
          {MEMBERS.map((member, index) => (
            <View key={member.nim} style={styles.memberCard}>
              <View style={[styles.avatarBox, { backgroundColor: member.color }]}>
                <Text style={styles.avatarText}>{member.initials}</Text>
              </View>
              <View style={styles.memberInfo}>
                <View style={styles.memberHeaderRow}>
                  <Text style={styles.memberNimLabel}>NIM: {member.nim}</Text>
                  <View style={styles.memberIndexBadge}>
                    <Text style={styles.memberIndexText}>#{index + 1}</Text>
                  </View>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: color.bg,
  },
  container: {
    padding: space.lg,
    paddingBottom: space.xxl,
    gap: space.lg,
    backgroundColor: color.bg,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: color.surface,
    padding: space.xl,
    borderRadius: radius.card,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: color.border,
    boxShadow: shadow.card,
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.surface2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: color.border,
  },
  heroTextWrap: {
    flex: 1,
    gap: 4,
  },
  groupBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  groupBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: color.primary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: color.text,
  },
  heroSubtitle: {
    fontSize: 13,
    color: color.text2,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: space.sm,
    marginBottom: -space.sm,
  },
  sectionTitle: {
    fontSize: tokens.type.section,
    fontWeight: "700",
    color: color.text,
  },
  countPill: {
    backgroundColor: color.surface2,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: color.text2,
  },
  membersList: {
    gap: space.md,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: color.surface,
    padding: space.md,
    borderRadius: radius.card,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: color.border,
    boxShadow: shadow.card,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: color.onPrimary,
  },
  memberInfo: {
    flex: 1,
    gap: 3,
  },
  memberHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberNimLabel: {
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "700",
    color: color.primary,
  },
  memberIndexBadge: {
    backgroundColor: color.surface2,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
  },
  memberIndexText: {
    fontSize: 11,
    fontWeight: "600",
    color: color.text3,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "700",
    color: color.text,
    letterSpacing: 0.2,
  },
});
