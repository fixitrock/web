import { useState } from "react";
import { Redirect, router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatPhonePreview, toE164Phone } from "@/src/lib/phone";
import { useAuth } from "@/src/providers/auth-provider";

type AuthMode = "supabase" | "firebase";

export default function AuthScreen() {
  const {
    isAuthenticated,
    isBusy,
    sendSupabaseOtp,
    signInWithFirebase,
    verifySupabaseOtp,
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>("supabase");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const isPhoneValid = phone.length === 10;
  const isOtpValid = otp.length === 6;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSupabaseOtp = async () => {
    setError("");
    const result = await sendSupabaseOtp(toE164Phone(phone));

    if (result.error) {
      setError(result.error);
      return;
    }

    setStep("otp");
  };

  const handleFirebase = async () => {
    setError("");
    const result = await signInWithFirebase(phone);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.replace("/(tabs)");
  };

  const handleVerifyOtp = async () => {
    setError("");
    const result = await verifySupabaseOtp(toE164Phone(phone), otp);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.replace("/(tabs)");
  };

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
          <Text style={styles.eyebrow}>Fix iT Rock</Text>
          <Text style={styles.headerTitle}>
            Repair work, orders, and account access.
          </Text>
          <Text style={styles.headerCopy}>
            Sign in to the Fix iT Rock mobile app with your phone number using
            Supabase directly or Firebase through the web bridge.
          </Text>
        </View>

        <View style={styles.card}>
        <Text style={styles.sectionLabel}>Auth provider</Text>
        <View style={styles.modeRow}>
          <Pressable
            style={[
              styles.modeButton,
              mode === "supabase" ? styles.modeButtonActive : styles.modeButtonMuted,
            ]}
            onPress={() => {
              setMode("supabase");
              setStep("phone");
              setError("");
              setOtp("");
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === "supabase"
                  ? styles.modeButtonTextActive
                  : styles.modeButtonTextMuted,
              ]}
            >
              Supabase OTP
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeButton,
              mode === "firebase" ? styles.modeButtonActive : styles.modeButtonMuted,
            ]}
            onPress={() => {
              setMode("firebase");
              setStep("phone");
              setError("");
              setOtp("");
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === "firebase"
                  ? styles.modeButtonTextActive
                  : styles.modeButtonTextMuted,
              ]}
            >
              Firebase OTP
            </Text>
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            value={phone}
            placeholder="9927241144"
            placeholderTextColor="#8f8a80"
            keyboardType="number-pad"
            maxLength={10}
            style={styles.input}
            onChangeText={(value) => setPhone(value.replace(/\D/g, "").slice(0, 10))}
          />
          <Text style={styles.helpText}>
            Indian phone numbers only. We send the code to{" "}
            {formatPhonePreview(phone || "9927241144")}.
          </Text>
        </View>

        {mode === "supabase" && step === "otp" ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Enter the 6-digit code</Text>
            <TextInput
              value={otp}
              placeholder="123456"
              placeholderTextColor="#8f8a80"
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
              onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
            />
            <Text style={styles.helpText}>
              The OTP screen stays in-app for Supabase. Use resend if the code has expired.
            </Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {mode === "supabase" && step === "phone" ? (
          <Pressable
            style={[
              styles.primaryButton,
              (!isPhoneValid || isBusy) && styles.buttonDisabled,
            ]}
            disabled={!isPhoneValid || isBusy}
            onPress={() => void handleSupabaseOtp()}
          >
            <Text style={styles.primaryButtonText}>
              {isBusy ? "Sending..." : "Send OTP"}
            </Text>
          </Pressable>
        ) : null}

        {mode === "supabase" && step === "otp" ? (
          <View style={styles.buttonColumn}>
            <Pressable
              style={[
                styles.primaryButton,
                (!isOtpValid || isBusy) && styles.buttonDisabled,
              ]}
              disabled={!isOtpValid || isBusy}
              onPress={() => void handleVerifyOtp()}
            >
              <Text style={styles.primaryButtonText}>
                {isBusy ? "Verifying..." : "Verify OTP"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              disabled={isBusy}
              onPress={() => void handleSupabaseOtp()}
            >
              <Text style={styles.secondaryButtonText}>Resend OTP</Text>
            </Pressable>
          </View>
        ) : null}

        {mode === "firebase" ? (
          <Pressable
            style={[
              styles.secondaryButton,
              (!isPhoneValid || isBusy) && styles.buttonDisabled,
            ]}
            disabled={!isPhoneValid || isBusy}
            onPress={() => void handleFirebase()}
          >
            <Text style={styles.secondaryButtonText}>
              {isBusy ? "Opening browser..." : "Continue with Firebase"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.darkCard}>
        <Text style={styles.darkLabel}>Mobile workspace</Text>
        <Text style={styles.darkTitle}>Built for Fix iT Rock operations.</Text>
        <Text style={styles.darkCopy}>
          This build focuses on auth, order activity, transactions, and quick
          access to the Fix iT Rock workspace. Firebase uses a web handoff and
          returns a Supabase session to the app.
        </Text>
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
  card: {
    gap: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderRadius: 24,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: "rgba(22,22,22,0.55)",
  },
  modeRow: {
    flexDirection: "row",
    gap: 12,
  },
  modeButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonActive: {
    backgroundColor: "#171717",
  },
  modeButtonMuted: {
    backgroundColor: "#ebe5d8",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modeButtonTextActive: {
    color: "#ffffff",
  },
  modeButtonTextMuted: {
    color: "#252525",
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1b1b1b",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#161616",
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(22,22,22,0.65)",
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#b42318",
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
  secondaryButton: {
    backgroundColor: "#ebe5d8",
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#1b1b1b",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  darkCard: {
    gap: 10,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#161616",
  },
  darkLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: "rgba(255,255,255,0.55)",
  },
  darkTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  darkCopy: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.75)",
  },
});
