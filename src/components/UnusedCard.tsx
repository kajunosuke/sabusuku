import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Subscription } from '../types';
import { colors } from '../theme';
import { formatYen, monthlyAmount, yearlyAmount } from '../utils';
import { ServiceIcon } from './ServiceIcon';

type Props = {
  subscriptions: Subscription[];
  onPress: (sub: Subscription) => void;
};

/** 「使ってない」と答えたサブスクのまとめ（解約候補） */
export function UnusedCard({ subscriptions, onPress }: Props) {
  const monthly = subscriptions.reduce((sum, s) => sum + monthlyAmount(s), 0);
  const yearly = subscriptions.reduce((sum, s) => sum + yearlyAmount(s), 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>💸 使ってないサブスク</Text>
      <Text style={styles.total}>
        月<Text style={styles.amount}>{formatYen(monthly)}</Text>・年
        <Text style={styles.amount}>{formatYen(yearly)}</Text>
      </Text>
      <Text style={styles.hint}>解約すれば、これだけ節約できます</Text>

      <View style={styles.list}>
        {subscriptions.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => onPress(s)}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}
          >
            <ServiceIcon name={s.name} category={s.category} size={32} />
            <Text style={styles.itemName} numberOfLines={1}>
              {s.name}
            </Text>
            <Text style={styles.itemPrice}>月{formatYen(monthlyAmount(s))}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.danger },
  total: { fontSize: 14, color: colors.text, marginTop: 8, fontWeight: '600' },
  amount: { fontSize: 22, fontWeight: '800', color: colors.danger, fontVariant: ['tabular-nums'] },
  hint: { fontSize: 12, color: colors.subText, marginTop: 2 },
  list: { marginTop: 12, gap: 6 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  itemName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subText,
    fontVariant: ['tabular-nums'],
  },
});
