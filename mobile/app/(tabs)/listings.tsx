// mobile/app/(tabs)/listings.tsx — Buy & Sell EV marketplace screen
// Features: search, brand/city filter, WhatsApp share card, price alert modal, scan FAB
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Linking,
  Modal, Share, Alert, Platform, KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState, useCallback, useRef } from "react";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/colors";
import { savePushToken } from "@/lib/notifications";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface Listing {
  id: string;
  evName: string | null;
  price: number;
  year: number;
  mileage: number | null;
  city: string;
  batteryHealth: number | null;
  condition: string;
  contactWhatsapp: string | null;
  contactPhone: string | null;
  evModel: { brand: string; model: string } | null;
}

function gradeFor(h: number | null): { grade: string; color: string } | null {
  if (!h) return null;
  if (h >= 90) return { grade: "A", color: "#16A34A" };
  if (h >= 80) return { grade: "B", color: "#6366F1" };
  if (h >= 70) return { grade: "C", color: "#D97706" };
  if (h >= 60) return { grade: "D", color: "#EA580C" };
  return { grade: "F", color: "#DC2626" };
}

// ─── Listing share card (rendered offscreen for ViewShot) ─────────────────────
function ShareCardView({ item }: { item: Listing }) {
  const brand = item.evModel?.brand ?? item.evName?.split(" ")[0] ?? "EV";
  const model = item.evModel?.model ?? "";
  const name  = `${brand} ${model}`.trim() || item.evName || "Electric Vehicle";
  const batt  = gradeFor(item.batteryHealth);
  const price = `PKR ${(item.price / 1_000_000).toFixed(2)}M`;

  return (
    <View style={sc.card}>
      <LinearGradient colors={["#1E293B", "#0F172A"]} style={sc.header}>
        <Text style={sc.headerTag}>⚡ eWheelz</Text>
        {batt && (
          <View style={[sc.grade, { backgroundColor: batt.color }]}>
            <Text style={sc.gradeText}>🔋 Grade {batt.grade}</Text>
          </View>
        )}
      </LinearGradient>
      <View style={sc.body}>
        <Text style={sc.name}>{name}</Text>
        <Text style={sc.price}>{price}</Text>
        <View style={sc.row}>
          <Text style={sc.chip}>📅 {item.year}</Text>
          <Text style={sc.chip}>📍 {item.city}</Text>
          {item.mileage != null && <Text style={sc.chip}>🛣 {item.mileage.toLocaleString()} km</Text>}
        </View>
        <View style={sc.footer}>
          <Text style={sc.url}>ewheelz.pk</Text>
          <Text style={sc.cta}>View on eWheelz →</Text>
        </View>
      </View>
    </View>
  );
}

const sc = StyleSheet.create({
  card:     { width: 320, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" },
  header:   { padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTag:{ fontSize: 16, fontWeight: "900", color: "#34D399" },
  grade:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  gradeText:{ fontSize: 12, fontWeight: "800", color: "#fff" },
  body:     { padding: 16, gap: 8 },
  name:     { fontSize: 20, fontWeight: "900", color: "#0F172A" },
  price:    { fontSize: 26, fontWeight: "900", color: "#4F46E5" },
  row:      { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip:     { fontSize: 12, color: "#475569", backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  footer:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  url:      { fontSize: 11, color: "#94A3B8" },
  cta:      { fontSize: 12, fontWeight: "700", color: "#4F46E5" },
});

// ─── Single listing card ──────────────────────────────────────────────────────
function ListingCard({ item }: { item: Listing }) {
  const shotRef = useRef<ViewShot>(null);
  const brand   = item.evModel?.brand ?? item.evName?.split(" ")[0] ?? "EV";
  const model   = item.evModel?.model ?? "";
  const name    = `${brand} ${model}`.trim() || item.evName || "Electric Vehicle";
  const batt    = gradeFor(item.batteryHealth);
  const price   = `PKR ${(item.price / 1_000_000).toFixed(2)}M`;
  const waNum   = (item.contactWhatsapp ?? item.contactPhone ?? "").replace(/\D/g, "");
  const waMsg   = `Hi, I saw your ${name} (${item.year}) on eWheelz for ${price}. Is it available?`;

  async function shareToWhatsApp() {
    try {
      // Capture the ShareCardView (rendered offscreen inside ViewShot)
      const uri = await captureRef(shotRef, { format: "png", quality: 0.95, result: "tmpfile" });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: `Share ${name}`,
          UTI: "public.png",
        });
      } else {
        // Fallback: text share
        await Share.share({
          message: `⚡ ${name} for ${price} in ${item.city} (${item.year})\nView on eWheelz: ewheelz.pk`,
          title: name,
        });
      }
    } catch {
      await Share.share({
        message: `⚡ ${name} for ${price} in ${item.city}\neWheelz.pk`,
      });
    }
  }

  return (
    <View style={styles.card}>
      {/* Hidden share card — captured by ViewShot */}
      <View style={{ position: "absolute", left: -9999, top: 0 }}>
        <ViewShot ref={shotRef} options={{ format: "png", quality: 0.95 }}>
          <ShareCardView item={item} />
        </ViewShot>
      </View>

      {/* Visible card UI */}
      <LinearGradient colors={["#1E293B", "#0F172A"]} style={styles.cardHeader}>
        <View style={styles.brandPill}>
          <Text style={styles.brandPillText}>{brand}</Text>
        </View>
        {batt && (
          <View style={[styles.gradeBadge, { backgroundColor: batt.color }]}>
            <Text style={styles.gradeText}>{batt.grade}</Text>
          </View>
        )}
        <Text style={styles.cardPrice}>{price}</Text>
      </LinearGradient>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>{item.year}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>📍 {item.city}</Text>
          {item.mileage != null && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{item.mileage.toLocaleString()} km</Text>
            </>
          )}
        </View>
      </View>

      {/* CTA row — 3 actions */}
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.footerBtn}
          onPress={() => router.push(`/listing/${item.id}` as never)}>
          <Text style={[styles.footerBtnText, { color: Colors.primary }]}>View →</Text>
        </TouchableOpacity>

        {waNum ? (
          <TouchableOpacity style={[styles.footerBtn, styles.footerBtnBorder]}
            onPress={() => Linking.openURL(`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`)}>
            <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
            <Text style={[styles.footerBtnText, { color: "#25D366" }]}> Chat</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.footerBtn, styles.footerBtnBorder]}>
            <Text style={[styles.footerBtnText, { color: Colors.textLight }]}>No contact</Text>
          </View>
        )}

        <TouchableOpacity style={[styles.footerBtn, styles.footerBtnBorder]}
          onPress={shareToWhatsApp}>
          <Ionicons name="share-social-outline" size={14} color={Colors.textMuted} />
          <Text style={[styles.footerBtnText, { color: Colors.textMuted }]}> Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Price Alert Modal ────────────────────────────────────────────────────────
const BRANDS_OPT = ["BYD", "MG", "Hyundai", "Changan", "Deepal", "Tesla", "Xpeng"];
const CITIES_OPT = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Peshawar", "Faisalabad"];

function AlertModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [brand,    setBrand]    = useState("");
  const [city,     setCity]     = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [saving,   setSaving]   = useState(false);

  async function save() {
    const token = await AsyncStorage.getItem("pushToken");
    if (!token) {
      Alert.alert("Notifications off", "Enable notifications in Settings to receive price alerts.");
      return;
    }
    setSaving(true);
    try {
      const prefs = {
        brand:    brand   || undefined,
        city:     city    || undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) * 1_000_000 : undefined,
      };
      await savePushToken(token, prefs);
      Alert.alert("✅ Alert set!", `We'll notify you when a${brand ? ` ${brand}` : "n EV"} under PKR ${maxPrice || "any"}M arrives${city ? ` in ${city}` : ""}.`);
      onClose();
    } catch {
      Alert.alert("Error", "Could not save alert. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={modal.sheet}>
          {/* Handle bar */}
          <View style={modal.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient colors={["#4F46E5", "#6366F1"]} style={modal.hero}>
              <Text style={modal.heroIcon}>🔔</Text>
              <Text style={modal.heroTitle}>Price Alert</Text>
              <Text style={modal.heroSub}>Get notified instantly when a matching EV is listed</Text>
            </LinearGradient>

            <View style={modal.body}>
              {/* Brand */}
              <Text style={modal.label}>Brand (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: "row", gap: 8, paddingRight: 8 }}>
                  <TouchableOpacity
                    style={[modal.chip, !brand && modal.chipActive]}
                    onPress={() => setBrand("")}>
                    <Text style={[modal.chipText, !brand && modal.chipTextActive]}>Any</Text>
                  </TouchableOpacity>
                  {BRANDS_OPT.map(b => (
                    <TouchableOpacity
                      key={b}
                      style={[modal.chip, brand === b && modal.chipActive]}
                      onPress={() => setBrand(b)}>
                      <Text style={[modal.chipText, brand === b && modal.chipTextActive]}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* City */}
              <Text style={modal.label}>City (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: "row", gap: 8, paddingRight: 8 }}>
                  <TouchableOpacity
                    style={[modal.chip, !city && modal.chipActive]}
                    onPress={() => setCity("")}>
                    <Text style={[modal.chipText, !city && modal.chipTextActive]}>Any</Text>
                  </TouchableOpacity>
                  {CITIES_OPT.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[modal.chip, city === c && modal.chipActive]}
                      onPress={() => setCity(c)}>
                      <Text style={[modal.chipText, city === c && modal.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Max price */}
              <Text style={modal.label}>Max Price (Million PKR, optional)</Text>
              <View style={modal.inputWrap}>
                <Text style={modal.inputPrefix}>PKR</Text>
                <TextInput
                  style={modal.input}
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="e.g. 8"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                />
                <Text style={modal.inputSuffix}>M</Text>
              </View>

              {/* Summary */}
              <View style={modal.summary}>
                <Text style={modal.summaryText}>
                  🔔 Alert for:{" "}
                  <Text style={{ fontWeight: "800" }}>
                    {brand || "Any EV"}{city ? ` in ${city}` : ""}{maxPrice ? ` under PKR ${maxPrice}M` : ""}
                  </Text>
                </Text>
              </View>

              {/* CTA */}
              <TouchableOpacity
                style={[modal.saveBtn, saving && { opacity: 0.6 }]}
                onPress={save}
                disabled={saving}>
                <LinearGradient colors={["#4F46E5", "#6366F1"]} style={modal.saveBtnGrad}>
                  {saving
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={modal.saveBtnText}>Set Alert →</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modal = StyleSheet.create({
  sheet:   { flex: 1, backgroundColor: Colors.bg },
  handle:  { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
  hero:    { padding: 24, alignItems: "center", gap: 6 },
  heroIcon:{ fontSize: 36 },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  heroSub:   { fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center" },
  body:    { padding: 20, gap: 4 },
  label:   { fontSize: 11, fontWeight: "700", color: Colors.textLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  chip:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1.5, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: Colors.textMuted },
  chipTextActive: { color: "#fff", fontWeight: "800" },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 14, marginBottom: 16 },
  inputPrefix: { fontSize: 14, fontWeight: "700", color: Colors.textLight, marginRight: 6 },
  input:   { flex: 1, fontSize: 16, fontWeight: "700", color: Colors.text, paddingVertical: 12 },
  inputSuffix: { fontSize: 14, fontWeight: "700", color: Colors.textLight, marginLeft: 4 },
  summary: { backgroundColor: "#EEF2FF", borderRadius: 12, padding: 14, marginBottom: 16 },
  summaryText: { fontSize: 13, color: "#4F46E5" },
  saveBtn:     { borderRadius: 14, overflow: "hidden", marginBottom: 12 },
  saveBtnGrad: { paddingVertical: 16, alignItems: "center" },
  saveBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },
  cancelBtn:   { alignItems: "center", paddingVertical: 8 },
  cancelText:  { fontSize: 14, color: Colors.textMuted, fontWeight: "600" },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
const BRANDS = ["All", "BYD", "MG", "Hyundai", "Changan", "Deepal", "Tesla", "Xpeng"];
const CITIES = ["All", "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Peshawar", "Faisalabad"];

export default function ListingsScreen() {
  const insets = useSafeAreaInsets();
  const [listings, setListings]   = useState<Listing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState("");
  const [brand, setBrand]         = useState("All");
  const [city, setCity]           = useState("All");
  const [total, setTotal]         = useState(0);
  const [alertModal, setAlertModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const qs = new URLSearchParams({ limit: "30" });
      if (brand !== "All") qs.set("brand", brand);
      if (city  !== "All") qs.set("city",  city);
      const res  = await fetch(`${BASE}/api/listings?${qs}`);
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.listings ?? []);
      setListings(items);
      setTotal(Array.isArray(data) ? items.length : (data.total ?? items.length));
    } catch { /* keep old data */ }
    finally   { setLoading(false); setRefreshing(false); }
  }, [brand, city]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const filtered = search.trim()
    ? listings.filter(l => {
        const q = search.toLowerCase();
        const n = `${l.evModel?.brand ?? ""} ${l.evModel?.model ?? ""} ${l.evName ?? ""} ${l.city}`.toLowerCase();
        return n.includes(q);
      })
    : listings;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#6366F1","#4F46E5","#7C3AED"]} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Marketplace</Text>
            <Text style={styles.headerSub}>{total} active listings</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* Price alert bell */}
            <TouchableOpacity style={styles.iconBtn} onPress={() => setAlertModal(true)}>
              <Ionicons name="notifications-outline" size={18} color="#fff" />
            </TouchableOpacity>
            {/* Post listing */}
            <TouchableOpacity style={styles.postBtn}
              onPress={() => Linking.openURL(`${BASE}/en/listings/post`)}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.postBtnText}>Sell</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search BYD, MG, city..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Brand filter */}
      <FlatList
        data={BRANDS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={b => b}
        style={styles.filterRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item: b }) => (
          <TouchableOpacity
            style={[styles.pill, brand === b && styles.pillActive]}
            onPress={() => setBrand(b)}>
            <Text style={[styles.pillText, brand === b && styles.pillTextActive]}>{b}</Text>
          </TouchableOpacity>
        )}
      />

      {/* City filter */}
      <FlatList
        data={CITIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={c => c}
        style={[styles.filterRow, { marginTop: -4 }]}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item: c }) => (
          <TouchableOpacity
            style={[styles.pill, styles.cityPill, city === c && styles.pillCityActive]}
            onPress={() => setCity(c)}>
            <Text style={[styles.pillText, city === c && { color: Colors.green, fontWeight: "700" }]}>{c}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Listings */}
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔋</Text>
          <Text style={styles.emptyText}>No listings found</Text>
          <TouchableOpacity onPress={() => { setBrand("All"); setCity("All"); setSearch(""); }}>
            <Text style={styles.emptyLink}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={l => l.id}
          renderItem={({ item }) => <ListingCard item={item} />}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
          }
        />
      )}

      {/* Scan FAB — bottom right */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 74 }]}
        onPress={() => router.push("/scan" as never)}
        activeOpacity={0.85}>
        <LinearGradient colors={["#6366F1", "#4F46E5"]} style={styles.fabGrad}>
          <Ionicons name="camera" size={22} color="#fff" />
          <Text style={styles.fabText}>Scan Ad</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Price alert modal */}
      <AlertModal visible={alertModal} onClose={() => setAlertModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 1 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  postBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  postBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fff", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text, padding: 0 },
  filterRow: { paddingVertical: 10, maxHeight: 48 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.border,
  },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  cityPill: { backgroundColor: Colors.bg },
  pillCityActive: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  pillText: { fontSize: 12, fontWeight: "600", color: Colors.textMuted },
  pillTextActive: { color: "#fff", fontWeight: "700" },
  // Card
  card: {
    backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { height: 100, padding: 12, justifyContent: "flex-end", position: "relative" },
  brandPill: {
    position: "absolute", top: 10, left: 12,
    backgroundColor: "rgba(15,23,42,0.65)", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  brandPillText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  gradeBadge: {
    position: "absolute", top: 10, right: 12,
    width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center",
  },
  gradeText: { fontSize: 13, fontWeight: "900", color: "#fff" },
  cardPrice: { fontSize: 18, fontWeight: "900", color: "#34D399" },
  cardBody: { padding: 12, paddingBottom: 8 },
  cardName: { fontSize: 14, fontWeight: "800", color: Colors.text, marginBottom: 4 },
  cardMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 },
  metaText: { fontSize: 11, color: Colors.textLight },
  metaDot: { fontSize: 11, color: Colors.border },
  cardFooter: {
    flexDirection: "row", borderTopWidth: 1, borderTopColor: Colors.border,
  },
  footerBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 10, gap: 4,
  },
  footerBtnBorder: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  footerBtnText: { fontSize: 12, fontWeight: "700" },
  // FAB
  fab: {
    position: "absolute", right: 20,
    borderRadius: 30, overflow: "hidden",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  fabGrad: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 18, paddingVertical: 13,
  },
  fabText: { fontSize: 14, fontWeight: "800", color: "#fff" },
  // Empty
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, fontWeight: "700", color: Colors.textMuted },
  emptyLink: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
});
