// mobile/app/scan.tsx
// Camera scan → OCR → Deal Check
// Killer feature: point camera at any WhatsApp screenshot → instant verdict

import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  ScrollView, TextInput, Alert, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/colors";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type Verdict = "GOOD_DEAL" | "FAIR_DEAL" | "OVERPRICED" | "RED_FLAGS" | "UNKNOWN";

const VERDICT: Record<Verdict, { label: string; color: string; bg: string }> = {
  GOOD_DEAL:  { label: "Good Deal ✓",  color: "#16A34A", bg: "#F0FDF4" },
  FAIR_DEAL:  { label: "Fair Deal",    color: "#4F46E5", bg: "#EEF2FF" },
  OVERPRICED: { label: "Overpriced ↑", color: "#D97706", bg: "#FFFBEB" },
  RED_FLAGS:  { label: "Red Flags ⚠",  color: "#DC2626", bg: "#FEF2F2" },
  UNKNOWN:    { label: "Unclear",      color: "#64748B", bg: "#F6F8FF" },
};

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri]   = useState<string | null>(null);
  const [text, setText]           = useState("");
  const [ocrLoading, setOcrLoad]  = useState(false);
  const [checking, setChecking]   = useState(false);
  const [result, setResult]       = useState<any>(null);

  // ── Step 1: pick image ───────────────────────────────────────────────────
  async function pickImage(fromCamera: boolean) {
    const fn = fromCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (perm.status !== "granted") {
      Alert.alert("Permission needed", "Allow camera/photo access in Settings.");
      return;
    }

    const res = await fn({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.85,
    });

    if (res.canceled || !res.assets?.[0]) return;

    const asset = res.assets[0];
    setImageUri(asset.uri);
    setResult(null);
    setText("");

    // ── Step 2: OCR ─────────────────────────────────────────────────────
    if (asset.base64) {
      setOcrLoad(true);
      try {
        const ocrRes = await fetch(`${BASE}/api/ocr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: asset.base64, mimeType: "image/jpeg" }),
        });
        const ocrData = await ocrRes.json();
        if (ocrData.text) setText(ocrData.text);
      } catch {
        Alert.alert("OCR failed", "Could not read text. Type or paste the ad manually.");
      } finally {
        setOcrLoad(false);
      }
    }
  }

  // ── Step 3: Deal check ───────────────────────────────────────────────────
  async function runCheck() {
    if (!text.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const res  = await fetch(`${BASE}/api/deal-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      setResult(await res.json());
    } catch {
      Alert.alert("Error", "Check failed — try again.");
    } finally {
      setChecking(false);
    }
  }

  const v = result?.analysis?.verdict as Verdict | undefined;
  const vs = v ? VERDICT[v] ?? VERDICT.UNKNOWN : null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Scan & Check</Text>
          <Text style={styles.headerSub}>Point at any WhatsApp or OLX ad</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* Pick buttons */}
        {!imageUri && (
          <View style={styles.pickSection}>
            <View style={styles.pickIconWrap}>
              <Text style={styles.pickIcon}>📸</Text>
            </View>
            <Text style={styles.pickTitle}>Scan an EV ad</Text>
            <Text style={styles.pickSub}>Take a photo or pick a screenshot — we extract the text automatically</Text>

            <View style={styles.pickBtns}>
              <TouchableOpacity style={styles.cameraBtn} onPress={() => pickImage(true)} activeOpacity={0.85}>
                <LinearGradient colors={["#6366F1","#4F46E5"]} style={styles.cameraBtnGrad}>
                  <Ionicons name="camera" size={22} color="#fff" />
                  <Text style={styles.cameraBtnText}>Open Camera</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)} activeOpacity={0.85}>
                <Ionicons name="images-outline" size={20} color={Colors.primary} />
                <Text style={styles.galleryBtnText}>Pick Screenshot</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Image preview */}
        {imageUri && (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
            <TouchableOpacity style={styles.retakeBtn} onPress={() => { setImageUri(null); setText(""); setResult(null); }}>
              <Ionicons name="refresh" size={14} color={Colors.primary} />
              <Text style={styles.retakeTxt}>Retake</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OCR loading */}
        {ocrLoading && (
          <View style={styles.ocrLoader}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.ocrText}>Reading text from image...</Text>
          </View>
        )}

        {/* Extracted text (editable) */}
        {(imageUri || text) && !ocrLoading && (
          <View style={styles.textSection}>
            <Text style={styles.textLabel}>Extracted text — edit if needed</Text>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={5}
              placeholder="Text will appear here after scanning..."
              placeholderTextColor={Colors.textLight}
            />

            <TouchableOpacity
              style={[styles.checkBtn, (!text.trim() || checking) && { opacity: 0.5 }]}
              onPress={runCheck}
              disabled={!text.trim() || checking}
              activeOpacity={0.85}>
              <LinearGradient colors={["#6366F1","#4F46E5"]} style={styles.checkBtnGrad}>
                {checking
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.checkBtnText}>Should I Buy This? →</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Result */}
        {result && vs && (
          <View style={[styles.result, { backgroundColor: vs.bg, borderColor: vs.color + "40" }]}>
            <View style={styles.resultHeader}>
              <Text style={[styles.verdict, { color: vs.color }]}>{vs.label}</Text>
              <Text style={[styles.score, { color: vs.color }]}>{result.analysis.score}/100</Text>
            </View>

            <Text style={styles.priceVerdict}>{result.analysis.priceVerdict}</Text>

            {result.avgMarketPrice && (
              <Text style={styles.market}>
                {result.compsCount} similar listings · avg PKR {(result.avgMarketPrice / 1_000_000).toFixed(2)}M
              </Text>
            )}

            {result.analysis.flags?.length > 0 && (
              <View style={styles.flagsWrap}>
                <Text style={styles.flagsLabel}>Red Flags</Text>
                {result.analysis.flags.map((f: string, i: number) => (
                  <Text key={i} style={styles.flagItem}>✗ {f}</Text>
                ))}
              </View>
            )}

            {result.analysis.positives?.length > 0 && (
              <View style={styles.flagsWrap}>
                <Text style={[styles.flagsLabel, { color: "#16A34A" }]}>Positives</Text>
                {result.analysis.positives.map((p: string, i: number) => (
                  <Text key={i} style={[styles.flagItem, { color: "#15803D" }]}>✓ {p}</Text>
                ))}
              </View>
            )}

            {result.analysis.negotiationTip && (
              <View style={styles.tip}>
                <Text style={styles.tipText}>💡 {result.analysis.negotiationTip}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.scanAgainBtn} onPress={() => { setImageUri(null); setText(""); setResult(null); }}>
              <Text style={styles.scanAgainText}>Scan another ad</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: Colors.bg },
  header:  { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#fff" },
  headerSub:   { fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 1 },
  body: { flex: 1 },

  // Pick
  pickSection: { alignItems: "center", paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20 },
  pickIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  pickIcon:  { fontSize: 36 },
  pickTitle: { fontSize: 22, fontWeight: "900", color: Colors.text, marginBottom: 8, textAlign: "center" },
  pickSub:   { fontSize: 14, color: Colors.textMuted, textAlign: "center", lineHeight: 21, marginBottom: 28 },
  pickBtns:  { width: "100%", gap: 12 },
  cameraBtn: { borderRadius: 14, overflow: "hidden" },
  cameraBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  cameraBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  galleryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: "#fff" },
  galleryBtnText: { fontSize: 15, fontWeight: "700", color: Colors.primary },

  // Preview
  previewWrap:  { margin: 16, borderRadius: 16, overflow: "hidden", backgroundColor: "#1E293B" },
  preview:      { width: "100%", height: 200 },
  retakeBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  retakeTxt:    { fontSize: 13, fontWeight: "700", color: Colors.primary },

  // OCR
  ocrLoader: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  ocrText:   { fontSize: 13, color: Colors.textMuted },

  // Text
  textSection: { paddingHorizontal: 16, gap: 12 },
  textLabel:   { fontSize: 12, fontWeight: "700", color: Colors.textLight, textTransform: "uppercase", letterSpacing: 0.5 },
  textInput:   { backgroundColor: "#fff", borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, padding: 14, fontSize: 14, color: Colors.text, minHeight: 110, textAlignVertical: "top" },
  checkBtn:    { borderRadius: 14, overflow: "hidden" },
  checkBtnGrad:{ paddingVertical: 16, alignItems: "center" },
  checkBtnText:{ fontSize: 15, fontWeight: "800", color: "#fff" },

  // Result
  result:       { margin: 16, borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 10 },
  resultHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  verdict:      { fontSize: 20, fontWeight: "900" },
  score:        { fontSize: 24, fontWeight: "900" },
  priceVerdict: { fontSize: 14, fontWeight: "600", color: Colors.text },
  market:       { fontSize: 12, color: Colors.textLight },
  flagsWrap:    { gap: 4 },
  flagsLabel:   { fontSize: 10, fontWeight: "900", color: "#DC2626", textTransform: "uppercase", letterSpacing: 0.5 },
  flagItem:     { fontSize: 13, color: Colors.text },
  tip:          { backgroundColor: "#fff", borderRadius: 10, padding: 12 },
  tipText:      { fontSize: 13, fontWeight: "600", color: "#4F46E5" },
  scanAgainBtn: { alignItems: "center", paddingTop: 4 },
  scanAgainText:{ fontSize: 13, fontWeight: "700", color: Colors.primary },
});
