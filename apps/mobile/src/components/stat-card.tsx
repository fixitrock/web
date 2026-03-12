import { Card } from "heroui-native";
import { Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: Props) {
  return (
    <Card className="flex-1 border border-black/8 bg-white/80 shadow-none dark:border-white/10 dark:bg-white/5">
      <Card.Body className="gap-2 p-4">
        <Text className="text-xs uppercase tracking-[1.8px] text-foreground/55">
          {label}
        </Text>
        <View>
          <Text className="text-2xl font-semibold text-foreground">{value}</Text>
        </View>
      </Card.Body>
    </Card>
  );
}
