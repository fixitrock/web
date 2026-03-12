import { HeroUINativeProvider } from "heroui-native";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from "react-native-keyboard-controller";
import { Uniwind } from "uniwind";

import "@/global.css";
import { AuthProvider } from "@/src/providers/auth-provider";

function AppProviders() {
  return (
    <AuthProvider>
      <HeroUINativeProvider
        config={{
          textProps: {
            maxFontSizeMultiplier: 1.8,
          },
          toast: {
            contentWrapper: (children) => (
              <KeyboardAvoidingView
                pointerEvents="box-none"
                behavior="padding"
                keyboardVerticalOffset={12}
                className="flex-1"
              >
                {children}
              </KeyboardAvoidingView>
            ),
          },
          devInfo: {
            stylingPrinciples: false,
          },
        }}
      >
        <Slot />
      </HeroUINativeProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    Uniwind.setTheme(colorScheme === "dark" ? "dark" : "light");
  }, [colorScheme]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <AppProviders />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
