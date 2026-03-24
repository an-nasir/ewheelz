// components/ArticleCard.tsx — News / article card
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import type { Article } from "@/lib/api";

const CATEGORY_STYLES: Record<string, { bg: string; color: string; emoji: string }> = {
  review:    { bg: "#EEF2FF", color: "#4F46E5", emoji: "⭐" },
  news:      { bg: "#F0FDF4", color: "#16A34A", emoji: "📰" },
  tutorial:  { bg: "#FFFBEB", color: "#B45309", emoji: "📚" },
  comparison:{ bg: "#FFF1F2", color: "#BE123C", emoji: "⚖️" },
  guide:     { bg: "#F0F9FF", color: "#0284C7", emoji: "🗺️" },
};

function readingTime(content: string): string {
  const words = content.split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function fmtDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return "";
  }
}

interface Props {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: Props) {
  const cat = CATEGORY_STYLES[article.category.toLowerCase()] ?? CATEGORY_STYLES.news;

  if (featured) {
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => router.push(`/article/${article.slug}`)}
        activeOpacity={0.8}
      >
        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: cat.color }]} />

        <View style={styles.featuredBody}>
          <View style={styles.row}>
            <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catText, { color: cat.color }]}>
                {article.category}
              </Text>
            </View>
            <Text style={styles.readTime}>{readingTime(article.content)}</Text>
          </View>

          <Text style={styles.featuredTitle} numberOfLines={2}>
            {article.title}
          </Text>

          {article.excerpt && (
            <Text style={styles.excerpt} numberOfLines={2}>
              {article.excerpt}
            </Text>
          )}

          <View style={[styles.row, styles.footerRow]}>
            <Text style={styles.date}>{fmtDate(article.publishedAt ?? article.createdAt)}</Text>
            <View style={styles.readMore}>
              <Text style={[styles.readMoreText, { color: cat.color }]}>Read more</Text>
              <Ionicons name="arrow-forward" size={12} color={cat.color} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/article/${article.slug}`)}
      activeOpacity={0.8}
    >
      <View style={[styles.catDot, { backgroundColor: cat.color }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <Text style={[styles.catSmall, { color: cat.color }]}>
            {cat.emoji} {article.category}
          </Text>
          <Text style={styles.dateSmall}>{fmtDate(article.publishedAt ?? article.createdAt)}</Text>
        </View>
        <Text style={styles.titleSmall} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.readTimeSmall}>{readingTime(article.content)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured card
  featuredCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  featuredBody: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  catEmoji: { fontSize: 12 },
  catText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  readTime: {
    fontSize: 11,
    color: Colors.textLight,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 6,
  },
  excerpt: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
    marginBottom: 12,
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginBottom: 0,
  },
  date: {
    fontSize: 11,
    color: Colors.textLight,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  readMoreText: {
    fontSize: 11,
    fontWeight: "700",
  },
  // Compact card
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  catSmall: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dateSmall: {
    fontSize: 11,
    color: Colors.textLight,
  },
  titleSmall: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 18,
    marginTop: 3,
    marginBottom: 3,
  },
  readTimeSmall: {
    fontSize: 11,
    color: Colors.textLight,
  },
});
