import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

type Props = PropsWithChildren<{
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
}>;

export function AppScreen({ children, header, footer, scroll = true }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-[#f5efe2] dark:bg-[#09090b]">
      <StatusBar style="auto" />
      <View className="absolute -top-16 -right-12 size-56 rounded-full bg-[#e8bb61]/35 dark:bg-[#e8bb61]/12" />
      <View className="absolute -left-18 top-56 size-48 rounded-full bg-[#de6e4b]/18 dark:bg-[#de6e4b]/10" />
      {scroll ? (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stack}>
            {header}
            {children}
            {footer}
          </View>
        </ScrollView>
      ) : (
        <View style={[styles.body, styles.staticContent]}>
          <View style={styles.stack}>
            {header}
            {children}
            {footer}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    flexGrow: 1,
  },
  staticContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  stack: {
    width: "100%",
    gap: 20,
  },
});
