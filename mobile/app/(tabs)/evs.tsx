// app/(tabs)/evs.tsx — EV Browse screen
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Colors } from "@/constants/colors";
import GradientHero from "@/components/GradientHero";
import EvCard from "@/components/EvCard";
import { fetchEvModels, type EvModel } from "@/lib/api";

const FILTERS = ["All", "BEV", "PHEV", "HEV"] as const;
type Filter = typeof FILTERS[number];

export default function EvsScreen() {
  const [evs, setEvs]         = useState<EvModel[]>([]);
  const [filtered, setFiltered] = useState<EvModel[]>([]);
  const [search, setSearch]   = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetchEvModels({ limit: 100 })
      .then((data) => { setEvs(data); setFiltered(data); })
      .catch(() => setError("Could not load EVs. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  // Filter + search logic
  useEffect(() => {
    let result = evs;
    if (activeFilter !== "All") {
      result = result.filter((e) => e.powertrain === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        `${e.brand} ${e.model} ${e.variant ?? ""}`.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [evs, search, activeFilter]);

  const renderHeader = useCallback(() => (
    <>
      <GradientHero
        title="EV Database"
        subtitle={`${evs.length} electric vehicles in Pakistan`}
        badge="🚗 Browse"
        gradient={Colors.gradientHero}
      />

      <View style={styles.controls}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search brand or model…"
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={{ flex: 1 }} />
          <Text style={styles.resultCount}>{filtered.length} results</Text>
        </View>
      </View>
    </>
  ), [evs.length, search, activeFilter, filtered.length]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <GradientHero title="EV Database" subtitle="Loading…" badge="🚗 Browse" />
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <GradientHero title="EV Database" badge="🚗 Browse" />
        <View style={styles.errorWrap}>
          <Ionicons name="wifi-outline" size={40} color={Colors.textLight} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EvCard ev={item} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No EVs match your search</Text>
            <TouchableOpacity onPress={() => { setSearch(""); setActiveFilter("All"); }}>
              <Text style={styles.clearBtn}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
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
    marginBottom: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.borderStrong,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  resultCount: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: "500",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  errorWrap: {
    alignItems: "center",
    marginTop: 60,
    gap: 12,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  clearBtn: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 4,
  },
});
