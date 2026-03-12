import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";

import { makeWebUrl } from "@/src/lib/config";
import { shortcutCards } from "@/src/lib/navigation";
import { useAuth } from "@/src/providers/auth-provider";

const homeActions = [
  { label: "Open Space", route: "/(tabs)/space" as const },
  { label: "View Orders", route: "/(tabs)/orders" as const },
  { label: "Transactions", route: "/(tabs)/transactions" as const },
];

export default function ShortcutsScreen() {
  const { profile } = useAuth();
  const firstName = profile?.name?.split(" ")[0] || "there";

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbLeft} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            {profile?.username ? `@${profile.username}` : "Fix iT Rock"}
          </Text>
          <Text style={styles.headerTitle}>{`Hi ${firstName}.`}</Text>
          <Text style={styles.headerCopy}>
            Open the core Fix iT Rock tools from one place: space, orders,
            transactions, and your linked web workspace.
          </Text>
        </View>

        <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Fix iT Rock mobile</Text>
        <Text style={styles.heroTitle}>{profile?.name || "Repair workspace"}</Text>
        <Text style={styles.heroCopy}>
          This app is branded for Fix iT Rock and wired to the same data and
          tools as the main web product.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Quick actions</Text>
        <View style={styles.buttonColumn}>
          {homeActions.map((item) => (
            <Pressable
              key={item.label}
              style={styles.primaryButton}
              onPress={() => router.push(item.route)}
            >
              <Text style={styles.primaryButtonText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Phone</Text>
          <Text style={styles.statValue}>{profile?.phone || "Not available"}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Auth</Text>
          <Text style={styles.statValue}>Live session</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Web shortcuts</Text>
        {shortcutCards.slice(0, 3).map((item) => (
          <View key={item.title} style={styles.shortcutCard}>
            <View style={styles.shortcutHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
              <Text style={styles.shortcutTitle}>{item.title}</Text>
              <Text style={styles.shortcutCopy}>{item.description}</Text>
            </View>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => void WebBrowser.openBrowserAsync(makeWebUrl(item.href))}
            >
              <Text style={styles.secondaryButtonText}>Open on web</Text>
            </Pressable>
          </View>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5efe2",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 120,
    gap: 20,
  },
  backgroundOrbTop: {
    position: "absolute",
    top: -64,
    right: -48,
    width: 224,
    height: 224,
    borderRadius: 999,
    backgroundColor: "rgba(232,187,97,0.35)",
  },
  backgroundOrbLeft: {
    position: "absolute",
    top: 230,
    left: -72,
    width: 192,
    height: 192,
    borderRadius: 999,
    backgroundColor: "rgba(222,110,75,0.18)",
  },
  header: {
    gap: 10,
  },
  eyebrow: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: "#343434",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: "#161616",
  },
  headerCopy: {
    maxWidth: 320,
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(22,22,22,0.72)",
  },
  heroCard: {
    gap: 10,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#161616",
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: "rgba(255,255,255,0.55)",
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#ffffff",
  },
  heroCopy: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.75)",
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: "rgba(22,22,22,0.55)",
  },
  buttonColumn: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#171717",
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.86)",
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: "rgba(22,22,22,0.55)",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#161616",
  },
  shortcutCard: {
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.86)",
    padding: 20,
  },
  shortcutHeader: {
    gap: 10,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(232,187,97,0.24)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9a6206",
  },
  shortcutTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#161616",
  },
  shortcutCopy: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(22,22,22,0.72)",
  },
  secondaryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ebe5d8",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#1b1b1b",
    fontSize: 14,
    fontWeight: "700",
  },
});
