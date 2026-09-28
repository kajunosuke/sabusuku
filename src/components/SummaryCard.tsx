import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, type Subscription } from '../types';
import { useColors, type Colors } from '../theme';
import { formatYen, monthlyAmount, yearlyAmount } from '../utils';

type Props = { subscriptions: Subscription[] };

export function SummaryCard({ subscriptions }: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const monthly = subscriptions.reduce((sum, s) => sum + monthlyAmount(s), 0);
  const yearly = subscriptions.reduce((sum, s) => sum + yearlyAmount(s), 0);

  const breakdown = CATEGORIES.map((c) => ({
    ...c,
    amount: subscriptions
      .filter((s) => s.category === c.id)
      .reduce((sum, s) => sum + monthlyAmount(s), 0),
  })).filter((c) => c.amount > 0);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>1か月あたり</Text>
      <Text style={styles.monthly}>{formatYen(monthly)}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>1年間で</Text>
          <Text style={styles.statValue}>{formatYen(yearly)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>契約中</Text>
          <Text style={styles.statValue}>{subscriptions.length}件</Text>
        </View>
      </View>

      {breakdown.length > 0 && (
        <>
          <View style={styles.bar}>
            {breakdown.map((c) => (
              <View key={c.id} style={{ flex: c.amount, backgroundColor: c.color }} />
            ))}
          </View>
          <View style={styles.legend}>
            {breakdown.map((c) => (
              <View key={c.id} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: c.color }]} />
                <Text style={styles.legendText}>
                  {c.label} {formatYen(c.amount)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
    },
    label: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
    monthly: {
      color: '#fff',
      fontSize: 40,
      fontWeight: '800',
      marginTop: 4,
      fontVariant: ['tabular-nums'],
    },
    statsRow: {
      flexDirection: 'row',
      marginTop: 16,
      backgroundColor: 'rgba(255,255,255,0.14)',
      borderRadius: 12,
      paddingVertical: 10,
    },
    stat: { flex: 1, alignItems: 'center' },
    statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    statValue: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
      marginTop: 2,
      fontVariant: ['tabular-nums'],
    },
    divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
    bar: {
      flexDirection: 'row',
      height: 10,
      borderRadius: 5,
      overflow: 'hidden',
      marginTop: 18,
      gap: 2,
      backgroundColor: '#fff',
    },
    legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#fff' },
    legendText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  });
}
