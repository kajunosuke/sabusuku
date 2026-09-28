import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Subscription } from '../types';
import { colors } from '../theme';
import { daysSince, formatYen, monthlyAmount } from '../utils';
import { ServiceIcon } from './ServiceIcon';

type Props = {
  sub: Subscription;
  remaining: number;
  onAnswer: (answer: 'used' | 'unused') => void;
  onSkip: () => void;
};

/** 「最近使ってる？」を1件ずつ聞くカード */
export function UsageCheckCard({ sub, remaining, onAnswer, onSkip }: Props) {
  const lastChecked =
    sub.usage === 'used' && sub.usageCheckedAt
      ? `前回「使ってる」と答えてから${daysSince(sub.usageCheckedAt)}日たちました`
      : `月${formatYen(monthlyAmount(sub))}払っています`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🤔 最近使ってる？</Text>
        <Text style={styles.count}>あと{remaining}件</Text>
      </View>

      <View style={styles.service}>
        <ServiceIcon name={sub.name} category={sub.category} size={52} />
        <View style={styles.serviceText}>
          <Text style={styles.name} numberOfLines={1}>
            {sub.name}
          </Text>
          <Text style={styles.sub}>{lastChecked}</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <Pressable
          onPress={() => onAnswer('used')}
          style={({ pressed }) => [styles.button, styles.used, pressed && styles.pressed]}
        >
          <Text style={[styles.buttonText, { color: colors.success }]}>👍 使ってる</Text>
        </Pressable>
        <Pressable
          onPress={() => onAnswer('unused')}
          style={({ pressed }) => [styles.button, styles.unused, pressed && styles.pressed]}
        >
          <Text style={[styles.buttonText, { color: colors.danger }]}>👎 使ってない</Text>
        </Pressable>
      </View>
      <Pressable onPress={onSkip} hitSlop={8} style={styles.skip}>
        <Text style={styles.skipText}>あとで</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  count: { fontSize: 12, fontWeight: '600', color: colors.subText },
  service: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  serviceText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.subText, marginTop: 3 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  button: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 14 },
  used: { backgroundColor: colors.successSoft },
  unused: { backgroundColor: colors.dangerSoft },
  pressed: { opacity: 0.7 },
  buttonText: { fontSize: 15, fontWeight: '800' },
  skip: { alignSelf: 'center', marginTop: 12 },
  skipText: { fontSize: 13, color: colors.subText, fontWeight: '600' },
});
