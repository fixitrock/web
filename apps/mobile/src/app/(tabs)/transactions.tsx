import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Button, Card, Spinner } from "heroui-native";
import { Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { AppScreen } from "@/src/components/app-screen";
import { BrandHeader } from "@/src/components/brand-header";
import { LockedCard } from "@/src/components/locked-card";
import { StatCard } from "@/src/components/stat-card";
import { makeWebUrl } from "@/src/lib/config";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/auth-provider";
import type {
  BalanceSummary,
  MyTransaction,
  TransactionSummary,
} from "@/src/types/user";

function formatCurrency(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

export default function AccountScreen() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [balance, setBalance] = useState<BalanceSummary>({ get: 0, give: 0 });
  const [transactions, setTransactions] = useState<MyTransaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        await refreshProfile();

        const [{ data: balanceData }, transactionsResult] = await Promise.all([
          supabase.rpc("balance"),
          profile?.id
            ? supabase.rpc("my_transactions", {
                u_id: profile.id,
                page: 1,
              })
            : Promise.resolve({ data: null }),
        ]);

        if (!active) {
          return;
        }

        setBalance((balanceData as BalanceSummary) ?? { get: 0, give: 0 });
        setTransactions(
          ((transactionsResult as { data?: { transactions?: MyTransaction[] } })
            ?.data?.transactions ?? []) as MyTransaction[]
        );
        setSummary(
          ((transactionsResult as { data?: { summary?: TransactionSummary } })
            ?.data?.summary ?? null) as TransactionSummary | null
        );
        setLoading(false);
      };

      void load();

      return () => {
        active = false;
      };
    }, [profile?.id, refreshProfile])
  );

  if (!profile) {
    return (
      <AppScreen
        header={
          <BrandHeader
            eyebrow="Transactions"
            title="No profile found."
            subtitle="Log in before opening transaction data."
          />
        }
      >
        <LockedCard
          title="Transactions"
          description="This tab uses the authenticated Supabase session. Sign in again to reload your balance and history."
          onPress={() => router.replace("/auth")}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      header={
        <BrandHeader
          eyebrow="Transactions"
          title={profile.name || profile.phone || "Fix iT Rock profile"}
          subtitle="Balance summary, recent transaction signals, and quick profile actions from the same Supabase backend used by Fix iT Rock on the web."
        />
      }
    >
      <Card className="border border-black/8 bg-[#161616] shadow-none dark:border-white/10">
        <Card.Body className="gap-2 p-5">
          <Text className="text-sm uppercase tracking-[1.8px] text-white/55">
            Handle
          </Text>
          <Text className="text-2xl font-semibold text-white">
            {profile.username ? `@${profile.username}` : profile.phone}
          </Text>
          <Text className="text-sm leading-6 text-white/75">
            {profile.bio || "Profile details come from public.users in Supabase."}
          </Text>
        </Card.Body>
      </Card>

      <View className="flex-row gap-3">
        <StatCard label="To Get" value={formatCurrency(balance.get)} />
        <StatCard label="To Give" value={formatCurrency(balance.give)} />
      </View>

      {summary ? (
        <View className="flex-row gap-3">
          <StatCard label="Balance" value={formatCurrency(summary.balance)} />
          <StatCard
            label="Received"
            value={formatCurrency(summary.totalReceived)}
          />
        </View>
      ) : null}

      <Card className="border border-black/8 bg-white/85 shadow-none dark:border-white/10 dark:bg-white/5">
        <Card.Body className="gap-4 p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-foreground">
              Recent transactions
            </Text>
            {loading ? <Spinner size="sm" /> : null}
          </View>
          {transactions.length === 0 && !loading ? (
            <Text className="text-sm leading-6 text-foreground/70">
              No transactions returned yet for this account.
            </Text>
          ) : null}
          <View className="gap-3">
            {transactions.slice(0, 5).map((item) => (
              <View
                key={item.id}
                className="rounded-2xl border border-black/6 bg-black/2 p-4 dark:border-white/8 dark:bg-white/3"
              >
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1 gap-1">
                    <Text className="text-base font-medium text-foreground">
                      {item.note || item.notes || "Transaction"}
                    </Text>
                    <Text className="text-sm text-foreground/55">
                      Order {item.orderID}
                    </Text>
                  </View>
                  <Text className="text-base font-semibold text-foreground">
                    {item.type === "credit" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card.Body>
      </Card>

      <View className="gap-3">
        <Button
          variant="secondary"
          className="rounded-full"
          onPress={() =>
            void WebBrowser.openBrowserAsync(
              makeWebUrl(profile.username ? `/@${profile.username}` : "/")
            )
          }
        >
          <Button.Label>Open web profile</Button.Label>
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          onPress={() => void signOut().then(() => router.replace("/auth"))}
        >
          <Button.Label>Sign out</Button.Label>
        </Button>
      </View>
    </AppScreen>
  );
}
