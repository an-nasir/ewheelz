// app/(tabs)/articles.tsx — News & Articles screen
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { Colors } from "@/constants/colors";
import GradientHero from "@/components/GradientHero";
import ArticleCard from "@/components/ArticleCard";
import { fetchArticles, type Article } from "@/lib/api";

const CATEGORIES = ["All", "News", "Review", "Tutorial", "Guide", "Comparison"];

export default function ArticlesScreen() {
  const [articles, setArticles]   = useState<Article[]>([]);
  const [filtered, setFiltered]   = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchArticles({ limit: 50 })
      .then((data) => { setArticles(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeCategory === "All") {
      setFiltered(articles);
    } else {
      setFiltered(
        articles.filter((a) =>
          a.category.toLowerCase() === activeCategory.toLowerCase()
        )
      );
    }
  }, [articles, activeCategory]);

  const renderHeader = useCallback(() => (
    <>
      <GradientHero
        title="EV News & Guides"
        subtitle="Stay updated with Pakistan's EV scene"
        badge="📰 Articles"
        gradient={["#1D4ED8", "#6366F1", "#8B5CF6"]}
      />

      {/* Category pills */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        renderItem={({ item: c }) => (
          <TouchableOpacity
            style={[styles.catPill, c === activeCategory && styles.catPillActive]}
            onPress={() => setActiveCategory(c)}
            activeOpacity={0.75}
          >
            <Text style={[styles.catText, c === activeCategory && styles.catTextActive]}>{c}</Text>
          </TouchableOpacity>
        )}
        style={styles.catList}
      />

      <Text style={styles.resultHint}>{filtered.length} article{filtered.length !== 1 ? "s" : ""}</Text>
    </>
  ), [activeCategory, filtered.length]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <GradientHero
          title="EV News & Guides"
          badge="📰 Articles"
          gradient={["#1D4ED8", "#6366F1", "#8B5CF6"]}
        />
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ArticleCard article={item} featured={index === 0 && activeCategory === "All"} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 36 }}>📰</Text>
            <Text style={styles.emptyText}>No articles in this category yet</Text>
            <TouchableOpacity onPress={() => setActiveCategory("All")}>
              <Text style={styles.clearBtn}>Show all articles</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  categoryRow: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  catList: { marginTop: 14, marginBottom: 4 },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.borderStrong,
  },
  catText: { fontSize: 13, fontWeight: "600", color: Colors.textMuted },
  catTextActive: { color: Colors.primary },
  resultHint: {
    fontSize: 12,
    color: Colors.textLight,
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 6,
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: { fontSize: 14, color: Colors.textMuted, fontWeight: "600" },
  clearBtn: { fontSize: 13, color: Colors.primary, fontWeight: "700", marginTop: 4 },
});
