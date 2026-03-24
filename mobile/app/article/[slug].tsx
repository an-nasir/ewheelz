// app/article/[slug].tsx — Article detail screen
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { Colors } from "@/constants/colors";
import { fetchArticles, type Article } from "@/lib/api";

const CATEGORY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  review:    { bg: "#EEF2FF", color: "#4F46E5", border: "#C7D2FE" },
  news:      { bg: "#F0FDF4", color: "#16A34A", border: "#86EFAC" },
  tutorial:  { bg: "#FFFBEB", color: "#B45309", border: "#FCD34D" },
  comparison:{ bg: "#FFF1F2", color: "#BE123C", border: "#FECACA" },
  guide:     { bg: "#F0F9FF", color: "#0284C7", border: "#BAE6FD" },
};

function fmtDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return ""; }
}

function readingTime(content: string): string {
  const mins = Math.max(1, Math.round(content.split(/\s+/).length / 200));
  return `${mins} min read`;
}

export default function ArticleDetailScreen() {
  const { slug }  = useLocalSearchParams<{ slug: string }>();
  const insets    = useSafeAreaInsets();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    // Fetch by slug — filter from list since there's no single-article endpoint
    fetchArticles({ limit: 100 })
      .then((arts) => setArticle(arts.find((a) => a.slug === slug) ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center", padding: 32 }]}>
        <Text style={{ color: Colors.textMuted, textAlign: "center" }}>Article not found.</Text>
      </View>
    );
  }

  const cat = CATEGORY_STYLES[article.category.toLowerCase()] ?? CATEGORY_STYLES.news;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Category + meta */}
        <View style={styles.metaRow}>
          <View style={[styles.catBadge, { backgroundColor: cat.bg, borderColor: cat.border }]}>
            <Text style={[styles.catText, { color: cat.color }]}>{article.category}</Text>
          </View>
          <Text style={styles.metaText}>{readingTime(article.content)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Date */}
        <Text style={styles.date}>{fmtDate(article.publishedAt ?? article.createdAt)}</Text>

        {/* Divider */}
        <View style={[styles.accentBar, { backgroundColor: cat.color }]} />

        {/* Excerpt */}
        {article.excerpt && (
          <View style={[styles.excerpt, { borderLeftColor: cat.color }]}>
            <Text style={styles.excerptText}>{article.excerpt}</Text>
          </View>
        )}

        {/* Body */}
        <Text style={styles.body}>{article.content}</Text>
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: { padding: 20 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  catText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
    lineHeight: 32,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 16,
  },
  accentBar: {
    height: 3,
    width: 48,
    borderRadius: 2,
    marginBottom: 20,
  },
  excerpt: {
    borderLeftWidth: 3,
    paddingLeft: 14,
    marginBottom: 20,
  },
  excerptText: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 24,
    fontStyle: "italic",
  },
  body: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 26,
  },
});
