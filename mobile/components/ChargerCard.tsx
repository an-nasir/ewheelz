// components/ChargerCard.tsx — Charging station card
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { ChargingStation } from "@/lib/api";

interface Props {
  station: ChargingStation;
  onReport?: (station: ChargingStation) => void;
}

const STATUS_CONFIG = {
  OPERATIONAL: { color: Colors.green,   bg: Colors.greenLight, label: "Online",  icon: "checkmark-circle" as const },
  BUSY:        { color: Colors.amber,   bg: Colors.amberLight, label: "Busy",    icon: "time" as const },
  OFFLINE:     { color: Colors.red,     bg: Colors.redLight,   label: "Offline", icon: "close-circle" as const },
};

export default function ChargerCard({ station, onReport }: Props) {
  const status = STATUS_CONFIG[station.liveStatus] ?? STATUS_CONFIG.OPERATIONAL;
  const isDcFast = station.maxPowerKw >= 50;
  const connectors = station.connectorTypes?.split(",").map(c => c.trim()) ?? [];

  return (
    <View style={styles.card}>
      {/* Status indicator stripe */}
      <View style={[styles.statusStripe, { backgroundColor: status.color }]} />

      <View style={styles.body}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons
              name="flash"
              size={18}
              color={isDcFast ? Colors.green : Colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{station.name}</Text>
            <Text style={styles.location}>{station.network} · {station.city}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{station.maxPowerKw} kW</Text>
            <Text style={styles.statLabel}>Max power</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{station.availableSpots}/{station.totalSpots}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {station.pricePerKwh ? `PKR ${station.pricePerKwh}` : "Free"}
            </Text>
            <Text style={styles.statLabel}>Per kWh</Text>
          </View>
        </View>

        {/* Connectors */}
        {connectors.length > 0 && (
          <View style={styles.connectors}>
            {connectors.slice(0, 4).map((c) => (
              <View key={c} style={styles.connectorPill}>
                <Text style={styles.connectorText}>{c}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Hours + report */}
        <View style={styles.footer}>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={13} color={Colors.textLight} />
            <Text style={styles.hours}>{station.operationalHours}</Text>
          </View>
          {onReport && (
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => onReport(station)}
              activeOpacity={0.75}
            >
              <Ionicons name="flag-outline" size={12} color={Colors.primary} />
              <Text style={styles.reportText}>Report status</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statusStripe: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  location: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.bg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  connectors: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  connectorPill: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  connectorText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hours: {
    fontSize: 12,
    color: Colors.textLight,
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reportText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
  },
});
