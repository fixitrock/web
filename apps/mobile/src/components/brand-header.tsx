import { StyleSheet, Text, useColorScheme, View } from "react-native";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle: string;
};

export function BrandHeader({ eyebrow, title, subtitle }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.wordmark}>
          <Text
            style={[styles.wordmarkTitle, { color: isDark ? "#fafafa" : "#161616" }]}
          >
            Fix iT Rock
          </Text>
          <Text
            style={[
              styles.wordmarkSubtitle,
              { color: isDark ? "rgba(255,255,255,0.58)" : "rgba(22,22,22,0.58)" },
            ]}
          >
            Repair workspace
          </Text>
        </View>
        {eyebrow ? (
          <View
            style={[
              styles.badge,
              isDark ? styles.badgeDark : styles.badgeLight,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isDark ? "#e5e7eb" : "#343434" },
              ]}
            >
              {eyebrow}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: isDark ? "#fafafa" : "#161616" }]}>
          {title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isDark ? "rgba(255,255,255,0.72)" : "rgba(22,22,22,0.72)" },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordmark: {
    gap: 2,
  },
  wordmarkTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  wordmarkSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  badgeLight: {
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  badgeDark: {
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.8,
  },
  copy: {
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  subtitle: {
    maxWidth: 320,
    fontSize: 16,
    lineHeight: 24,
  },
});
