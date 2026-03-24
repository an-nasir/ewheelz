// components/EvCard.tsx — EV model card (list + grid variants)
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import type { EvModel } from "@/lib/api";

const POWERTRAIN_STYLE: Record<string, { bg: string; color: string }> = {
  BEV:  { bg: "#DCFCE7", color: "#16A34A" },
  PHEV: { bg: "#EEF2FF", color: "#4F46E5" },
  HEV:  { bg: "#FFFBEB", color: "#B45309" },
  FCEV: { bg: "#F0F9FF", color: "#0284C7" },
};

interface Props {
  ev: EvModel;
  compact?: boolean;
}

export default function EvCard({ ev, compact = false }: Props) {
  const pt = POWERTRAIN_STYLE[ev.powertrain] ?? POWERTRAIN_STYLE.BEV;
  const name = `${ev.brand} ${ev.model}${ev.variant ? ` ${ev.variant}` : ""}`;
  const price = ev.pricePkrMin
    ? `PKR ${(ev.pricePkrMin / 1_000_000).toFixed(1)}M`
    : "Price TBD";

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => router.push(`/ev/${ev.slug}`)}
      activeOpacity={0.75}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: pt.color }]} />

      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <View style={[styles.ptBadge, { backgroundColor: pt.bg }]}>
                <Text style={[styles.ptText, { color: pt.color }]}>{ev.powertrain}</Text>
              </View>
              {ev.bodyStyle && (
                <Text style={styles.bodyStyle}>{ev.bodyStyle}</Text>
              )}
            </View>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
        </View>

        {!compact && (
          <>
            {/* Spec pills */}
            <View style={styles.specs}>
              {ev.wltpRangeKm && (
                <View style={styles.specPill}>
                  <Ionicons name="location-outline" size={11} color={Colors.primary} />
                  <Text style={styles.specText}>{ev.wltpRangeKm} km</Text>
                </View>
              )}
              {ev.batteryKwh && (
                <View style={styles.specPill}>
                  <Ionicons name="battery-charging-outline" size={11} color={Colors.green} />
                  <Text style={styles.specText}>{ev.batteryKwh} kWh</Text>
                </View>
              )}
              {ev.chargingDcKw && (
                <View style={styles.specPill}>
                  <Ionicons name="flash-outline" size={11} color={Colors.amber} />
                  <Text style={styles.specText}>{ev.chargingDcKw} kW DC</Text>
                </View>
              )}
              {ev.accelerationSec && (
                <View style={styles.specPill}>
                  <Ionicons name="speedometer-outline" size={11} color={Colors.textMuted} />
                  <Text style={styles.specText}>{ev.accelerationSec}s</Text>
                </View>
              )}
            </View>

            {/* Bottom row */}
            <View style={[styles.row, styles.bottomRow]}>
              <Text style={styles.price}>{price}</Text>
              <Text style={styles.seeMore}>View specs →</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCompact: {
    marginBottom: 8,
  },
  accentBar: {
    width: 4,
    backgroundColor: Colors.primary,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  ptBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ptText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bodyStyle: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: "500",
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 4,
  },
  specs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  specPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.bg,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  specText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  bottomRow: {
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary,
  },
  seeMore: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: "600",
  },
});
