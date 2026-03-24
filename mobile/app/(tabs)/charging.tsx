// app/(tabs)/charging.tsx — Charging Stations screen
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, Modal, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/colors";
import GradientHero from "@/components/GradientHero";
import ChargerCard from "@/components/ChargerCard";
import {
  fetchChargingStations, submitStationReport,
  type ChargingStation, type StationStatus,
} from "@/lib/api";

const CITIES = ["All", "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Quetta"];

const STATUS_BTNS: Array<{
  status: StationStatus; label: string; emoji: string;
  bg: string; color: string; border: string;
}> = [
  { status: "available", label: "Working",  emoji: "👍", bg: Colors.greenLight, color: Colors.greenDark, border: "#86EFAC" },
  { status: "busy",      label: "Slow",     emoji: "⚡", bg: Colors.amberLight, color: "#B45309",       border: "#FCD34D" },
  { status: "broken",    label: "Broken",   emoji: "👎", bg: Colors.redLight,   color: "#B91C1C",       border: "#FECACA" },
];

async function getSessionToken() {
  let token = await AsyncStorage.getItem("ewheelz_token");
  if (!token) {
    token = "anon_" + Math.random().toString(36).slice(2);
    await AsyncStorage.setItem("ewheelz_token", token);
  }
  return token;
}

export default function ChargingScreen() {
  const [stations, setStations]       = useState<ChargingStation[]>([]);
  const [filtered, setFiltered]       = useState<ChargingStation[]>([]);
  const [search, setSearch]           = useState("");
  const [city, setCity]               = useState("All");
  const [loading, setLoading]         = useState(true);
  const [reportTarget, setReportTarget] = useState<ChargingStation | null>(null);
  const [reporting, setReporting]     = useState(false);

  useEffect(() => {
    fetchChargingStations({ limit: 100 })
      .then((data) => { setStations(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter
  useEffect(() => {
    let result = stations;
    if (city !== "All") result = result.filter((s) => s.city === city);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        `${s.name} ${s.network} ${s.city}`.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [stations, search, city]);

  async function handleReport(station: ChargingStation, status: StationStatus) {
    setReporting(true);
    try {
      const token = await getSessionToken();
      await submitStationReport({
        stationId: station.id,
        stationName: station.name,
        status,
        sessionToken: token,
      });
      setReportTarget(null);
      Alert.alert("✓ Reported!", "Thanks — your report helps other EV drivers.", [{ text: "OK" }]);
    } catch {
      Alert.alert("Error", "Could not submit report. Try again.");
    } finally {
      setReporting(false);
    }
  }

  // Summary stats
  const operational = stations.filter((s) => s.liveStatus === "OPERATIONAL").length;
  const totalKw     = stations.reduce((sum, s) => sum + s.maxPowerKw, 0);

  const renderHeader = useCallback(() => (
    <>
      <GradientHero
        title="Charging Map"
        subtitle="Find EV chargers near you across Pakistan"
        badge="⚡ Chargers"
        gradient={Colors.gradientGreen}
      >
        {/* Hero stats */}
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{stations.length}</Text>
            <Text style={styles.heroStatLbl}>Stations</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{operational}</Text>
            <Text style={styles.heroStatLbl}>Online now</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{totalKw > 0 ? `${Math.round(totalKw / 1000)}MW` : "—"}</Text>
            <Text style={styles.heroStatLbl}>Total power</Text>
          </View>
        </View>
      </GradientHero>

      <View style={styles.controls}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={Colors.textLight} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stations or networks…"
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* City filter */}
        <FlatList
          horizontal
          data={CITIES}
          keyExtractor={(c) => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          renderItem={({ item: c }) => (
            <TouchableOpacity
              style={[styles.cityPill, c === city && styles.cityPillActive]}
              onPress={() => setCity(c)}
              activeOpacity={0.75}
            >
              <Text style={[styles.cityText, c === city && styles.cityTextActive]}>{c}</Text>
            </TouchableOpacity>
          )}
          style={{ marginBottom: 12 }}
        />

        <Text style={styles.resultHint}>
          {filtered.length} station{filtered.length !== 1 ? "s" : ""} found — tap to report status
        </Text>
      </View>
    </>
  ), [stations.length, operational, totalKw, search, city, filtered.length]);

  return (
    <View style={styles.screen}>
      {loading ? (
        <>
          <GradientHero title="Charging Map" badge="⚡ Chargers" gradient={Colors.gradientGreen} />
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        </>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChargerCard station={item} onReport={(s) => setReportTarget(s)} />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 36 }}>⚡</Text>
              <Text style={styles.emptyText}>No stations found for this filter</Text>
            </View>
          }
        />
      )}

      {/* ── Report Status Modal ── */}
      <Modal
        visible={!!reportTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setReportTarget(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setReportTarget(null)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Report Charger Status</Text>
          {reportTarget && (
            <Text style={styles.modalStation} numberOfLines={1}>{reportTarget.name}</Text>
          )}
          <Text style={styles.modalHint}>Is this charger working right now?</Text>

          <View style={styles.reportBtns}>
            {STATUS_BTNS.map((btn) => (
              <TouchableOpacity
                key={btn.status}
                style={[styles.reportBtn, { backgroundColor: btn.bg, borderColor: btn.border }]}
                onPress={() => reportTarget && handleReport(reportTarget, btn.status)}
                disabled={reporting}
                activeOpacity={0.8}
              >
                <Text style={styles.reportEmoji}>{btn.emoji}</Text>
                <Text style={[styles.reportLabel, { color: btn.color }]}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalFooter}>
            One tap · No account needed · Helps other drivers
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  heroStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    gap: 0,
  },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatNum: { fontSize: 18, fontWeight: "900", color: Colors.white },
  heroStatLbl: { fontSize: 10, color: "rgba(255,255,255,0.70)", marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.20)", marginVertical: 4 },
  controls: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  cityPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityPillActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  cityText: { fontSize: 13, fontWeight: "600", color: Colors.textMuted },
  cityTextActive: { color: Colors.greenDark },
  resultHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: { fontSize: 14, color: Colors.textMuted, fontWeight: "600" },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  modalStation: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  modalHint: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
    fontWeight: "500",
  },
  reportBtns: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  reportBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  reportEmoji: { fontSize: 26 },
  reportLabel: { fontSize: 13, fontWeight: "700" },
  modalFooter: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: "center",
  },
});
