import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Card, Spinner } from "heroui-native";
import { Text, View } from "react-native";

import { AppScreen } from "@/src/components/app-screen";
import { BrandHeader } from "@/src/components/brand-header";
import { StatCard } from "@/src/components/stat-card";
import { supabase } from "@/src/lib/supabase";
import type { MyOrderItem } from "@/src/types/user";

function formatCurrency(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<MyOrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        const { data } = await supabase.rpc("myorders", {
          query: null,
          page: 1,
        });

        if (!active) {
          return;
        }

        setOrders((data?.orders ?? []) as MyOrderItem[]);
        setTotal(data?.totalOrders ?? 0);
        setLoading(false);
      };

      void load();

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <AppScreen
      header={
        <BrandHeader
          eyebrow="Orders"
          title="Recent order activity from Supabase."
          subtitle="Track live Fix iT Rock order data from the same Supabase-backed system used by the web app."
        />
      }
    >
      <View className="flex-row gap-3">
        <StatCard label="Orders" value={String(total)} />
        <StatCard
          label="Loaded"
          value={loading ? "..." : String(orders.length)}
        />
      </View>

      {loading ? (
        <View className="items-center py-10">
          <Spinner size="lg" />
        </View>
      ) : null}

      {!loading && orders.length === 0 ? (
        <Card className="border border-dashed border-black/10 bg-white/70 shadow-none dark:border-white/10 dark:bg-white/5">
          <Card.Body className="p-5">
            <Text className="text-base leading-6 text-foreground/70">
              No orders returned yet for this account.
            </Text>
          </Card.Body>
        </Card>
      ) : null}

      <View className="gap-4">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="border border-black/8 bg-white/85 shadow-none dark:border-white/10 dark:bg-white/5"
          >
            <Card.Body className="gap-3 p-5">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1 gap-1">
                  <Text className="text-lg font-semibold text-foreground">
                    {order.name}
                  </Text>
                  <Text className="text-sm text-foreground/60">
                    {order.username ? `@${order.username}` : order.phone}
                  </Text>
                </View>
                <Text className="text-sm uppercase tracking-[1.6px] text-foreground/45">
                  {order.mode ?? "paylater"}
                </Text>
              </View>
              <View className="flex-row gap-3">
                <Text className="text-sm text-foreground/70">
                  {formatDate(order.createdAt)}
                </Text>
                <Text className="text-sm text-foreground/35">/</Text>
                <Text className="text-sm text-foreground/70">
                  {order.products?.length ?? 0} items
                </Text>
              </View>
              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="text-xs uppercase tracking-[1.8px] text-foreground/45">
                    Paid
                  </Text>
                  <Text className="text-xl font-semibold text-foreground">
                    {formatCurrency(order.paid)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs uppercase tracking-[1.8px] text-foreground/45">
                    Total
                  </Text>
                  <Text className="text-xl font-semibold text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </Text>
                </View>
              </View>
            </Card.Body>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
