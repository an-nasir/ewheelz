// app/(tabs)/index.tsx — Home screen
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Colors } from "@/constants/colors";
import EvCard from "@/components/EvCard";
import ArticleCard from "@/components/ArticleCard";
import { fetchEvModels, fetchStats, fetchArticles, type AppStats, type EvModel, type Article } from "@/lib/api";

// ─── Quick-action tiles ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: "car-sport",   label: "Browse EVs",       href: "/evs",       bg: Colors.gradientHero   },
  { icon: "flash",       label: "Find Chargers",    href: "/charging",  bg: Colors.gradientGreen  },
  { icon: "calculator",  label: "Cost Calculator",  href: "/",          bg: ["#F59E0B","#EF4444"] },
  { icon: "people",      label: "Community",        href: "/community", bg: ["#8B5CF6","#EC4899"] },
] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [stats, setStats]     = useState<AppStats | null>(null);
  const [evs, setEvs]         = useState<EvModel[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, e, a] = await Promise.all([
        fetchStats(),
        fetchEvModels({ limit: 4 }),
        fetchArticles({ limit: 3 }),
      ]);
      setStats(s);
      setEvs(e);
      setArticles(a);
    } catch { /* show cached / skeleton */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* ── Hero ── */}
      <LinearGradient
        colors={["#6366F1", "#4F46E5", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 24 }]}
      >
        {/* Blob decorations */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <View style={{ position: "relative", zIndex: 1 }}>
          <View style={styles.heroBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.heroBadgeText}>🇵🇰 Pakistan's EV Platform</Text>
          </View>
          <Text style={styles.heroTitle}>eWheelz</Text>
          <Text style={styles.heroSubtitle}>
            Discover electric vehicles, find chargers & join Pakistan's EV community
          </Text>

          {/* Stats bar */}
          {stats && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{stats.evModelCount}+</Text>
                <Text style={styles.statLbl}>EV Models</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{stats.chargingStationCount}+</Text>
                <Text style={styles.statLbl}>Chargers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{stats.reportCount}+</Text>
                <Text style={styles.statLbl}>Reports</Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionTile}
              onPress={() => router.push(action.href as never)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={action.bg as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <Ionicons name={action.icon as never} size={26} color="#fff" />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Why EV? Banner ── */}
        <View style={styles.whyBanner}>
          <LinearGradient
            colors={["#F0FDF4", "#DCFCE7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.whyGradient}
          >
            <Text style={styles.whyEmoji}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.whyTitle}>EV saves up to PKR 2,000/month</Text>
              <Text style={styles.whySub}>vs petrol at current fuel prices · tap to calculate</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.greenDark} />
          </LinearGradient>
        </View>

        {/* ── Featured EVs ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured EVs</Text>
          <TouchableOpacity onPress={() => router.push("/evs")}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          evs.map((ev) => <EvCard key={ev.id} ev={ev} />)
        )}

        {/* ── Latest News ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest News</Text>
          <TouchableOpacity onPress={() => router.push("/articles")}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          articles.map((a, i) => (
            <ArticleCard key={a.id} article={a} featured={i === 0} />
          ))
        )}

        {/* ── Community CTA ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/community")}
        >
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBanner}
          >
            <View>
              <Text style={styles.ctaTitle}>Help the EV community</Text>
              <Text style={styles.ctaSub}>Report charger status · Share efficiency data</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -80,
    right: -60,
  },
  blob2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -40,
    left: -30,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  heroBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: "900",
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.80)",
    lineHeight: 21,
    maxWidth: 280,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 14,
    padding: 14,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.white,
  },
  statLbl: {
    fontSize: 11,
    color: "rgba(255,255,255,0.70)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.20)",
    marginVertical: 4,
  },
  // Content
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 12,
  },
  // Quick actions
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  actionTile: {
    width: "47.5%",
    borderRadius: 14,
    overflow: "hidden",
  },
  actionGradient: {
    padding: 16,
    gap: 8,
    minHeight: 90,
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white,
  },
  // Why banner
  whyBanner: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  whyGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  whyEmoji: { fontSize: 22 },
  whyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.greenDark,
  },
  whySub: {
    fontSize: 11,
    color: "#22863A",
    marginTop: 2,
  },
  // CTA
  ctaBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.white,
    marginBottom: 3,
  },
  ctaSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.80)",
  },
});
