// app/(tabs)/community.tsx — Community & Data Reporting screen
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/colors";
import GradientHero from "@/components/GradientHero";
import {
  submitEfficiencyReport,
  fetchLeaderboard,
  type ChargingStation,
} from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LeaderboardRow {
  vehicleModel: string;
  avgEfficiency: number;
  reportCount: number;
  rank: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const EV_QUICK_REPORT = [
  { model: "BYD Atto 3",    whKm: 162 },
  { model: "MG ZS EV",      whKm: 175 },
  { model: "BYD Seal",      whKm: 155 },
  { model: "Hyundai Ioniq", whKm: 148 },
  { model: "BYD Dolphin",   whKm: 142 },
  { model: "Changan Uni-V", whKm: 190 },
];

const MEDALS = ["🥇", "🥈", "🥉"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getSessionToken(): Promise<string> {
  let token = await AsyncStorage.getItem("ewheelz_token");
  if (!token) {
    token = "anon_" + Math.random().toString(36).slice(2);
    await AsyncStorage.setItem("ewheelz_token", token);
  }
  return token;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [submitting, setSubmitting]   = useState<string | null>(null);
  const [reportedModels, setReportedModels] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      const board = await fetchLeaderboard();
      setLeaderboard(board);
    } catch { /* ignore, show empty state */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  async function handleEfficiencyReport(vehicleModel: string, efficiencyWhKm: number) {
    setSubmitting(vehicleModel);
    try {
      const token = await getSessionToken();
      await submitEfficiencyReport({ vehicleModel, efficiencyWhKm, sessionToken: token });
      setReportedModels((prev) => new Set([...prev, vehicleModel]));
      await loadData(); // refresh leaderboard
      Alert.alert(
        "✓ Logged!",
        `Thanks for reporting ${vehicleModel} efficiency. Your data helps the community.`,
        [{ text: "OK" }]
      );
    } catch {
      Alert.alert("Error", "Could not submit. Try again.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <GradientHero
        title="EV Community"
        subtitle="Share real-world data · help Pakistan go electric"
        badge="🤝 Contribute"
        gradient={["#7C3AED", "#6366F1", "#4F46E5"]}
      />

      <View style={styles.content}>

        {/* ── Why contribute ── */}
        <View style={styles.whyCard}>
          <View style={styles.whyRow}>
            {[
              { icon: "flash",    text: "Real charging data" },
              { icon: "location", text: "Accurate range info" },
              { icon: "people",   text: "Community trust" },
            ].map((item) => (
              <View key={item.text} style={styles.whyItem}>
                <View style={styles.whyIconWrap}>
                  <Ionicons name={item.icon as never} size={16} color={Colors.primary} />
                </View>
                <Text style={styles.whyText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Efficiency Report ── */}
        <Text style={styles.sectionTitle}>Report Your EV's Efficiency</Text>
        <Text style={styles.sectionSubtitle}>
          Tap your EV to confirm real-world kWh/100km — one tap, no account needed
        </Text>

        <View style={styles.evGrid}>
          {EV_QUICK_REPORT.map((ev) => {
            const isReported  = reportedModels.has(ev.model);
            const isSubmitting = submitting === ev.model;
            return (
              <TouchableOpacity
                key={ev.model}
                style={[styles.evTile, isReported && styles.evTileReported]}
                onPress={() => !isReported && handleEfficiencyReport(ev.model, ev.whKm)}
                disabled={isReported || !!submitting}
                activeOpacity={0.75}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={Colors.primary} size="small" />
                ) : isReported ? (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.greenDark} />
                ) : (
                  <Ionicons name="car-sport" size={18} color={Colors.primary} />
                )}
                <Text style={[styles.evTileModel, isReported && styles.evTileModelReported]} numberOfLines={1}>
                  {ev.model}
                </Text>
                <Text style={[styles.evTileVal, isReported && { color: Colors.greenDark }]}>
                  {(ev.whKm / 10).toFixed(1)} kWh/100km
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Leaderboard ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Efficiency Leaderboard</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
        <Text style={styles.sectionSubtitle}>Most efficient EVs ranked by community reports</Text>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 24 }} />
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyBoard}>
            <Text style={{ fontSize: 36 }}>🏆</Text>
            <Text style={styles.emptyBoardText}>
              No data yet — be the first to report!
            </Text>
          </View>
        ) : (
          <View style={styles.boardCard}>
            {leaderboard.slice(0, 10).map((row, i) => (
              <View
                key={row.vehicleModel}
                style={[styles.boardRow, i < leaderboard.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.border }]}
              >
                <Text style={styles.boardMedal}>
                  {i < 3 ? MEDALS[i] : `#${row.rank}`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boardModel}>{row.vehicleModel}</Text>
                  <Text style={styles.boardReports}>{row.reportCount} driver{row.reportCount !== 1 ? "s" : ""}</Text>
                </View>
                <View style={styles.boardEfficiencyWrap}>
                  <Text style={styles.boardEfficiency}>
                    {(row.avgEfficiency / 10).toFixed(1)}
                  </Text>
                  <Text style={styles.boardUnit}>kWh/100km</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Help tip ── */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.amber} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Tip: What is kWh/100km?</Text>
            <Text style={styles.tipBody}>
              It measures how much energy your EV uses per 100 km. Lower = more efficient.
              A typical EV uses 15–20 kWh/100km.
            </Text>
          </View>
        </View>

        {/* ── Data privacy note ── */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textLight} />
          <Text style={styles.privacyText}>
            No account needed. Data is anonymous. Used only to improve community accuracy.
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16 },

  // Why card
  whyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  whyRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  whyItem: { alignItems: "center", gap: 6 },
  whyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  whyText: { fontSize: 11, color: Colors.textMuted, fontWeight: "600", textAlign: "center" },

  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 14,
    lineHeight: 19,
  },

  // EV grid
  evGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  evTile: {
    width: "47%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 4,
  },
  evTileReported: {
    backgroundColor: Colors.greenLight,
    borderColor: "#86EFAC",
  },
  evTileModel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  evTileModelReported: {
    color: Colors.greenDark,
  },
  evTileVal: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.primary,
  },

  // Leaderboard
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  liveText: { fontSize: 11, fontWeight: "700", color: Colors.greenDark },

  boardCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 16,
  },
  boardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  boardMedal: {
    fontSize: 18,
    width: 32,
    textAlign: "center",
  },
  boardModel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  boardReports: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  boardEfficiencyWrap: {
    alignItems: "flex-end",
  },
  boardEfficiency: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.primary,
  },
  boardUnit: {
    fontSize: 10,
    color: Colors.textLight,
  },

  emptyBoard: {
    alignItems: "center",
    padding: 32,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    marginBottom: 16,
  },
  emptyBoardText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },

  // Tip
  tipCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.amberLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B45309",
    marginBottom: 3,
  },
  tipBody: {
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },

  // Privacy
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  privacyText: {
    fontSize: 11,
    color: Colors.textLight,
    flex: 1,
    lineHeight: 16,
  },
});
