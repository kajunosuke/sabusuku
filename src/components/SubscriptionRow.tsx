import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Subscription } from '../types';
import { useColors, type Colors } from '../theme';
import { ServiceIcon } from './ServiceIcon';
import {
  daysUntil,
  formatDate,
  formatYen,
  nextBillingDate,
  usageStatus,
  type UsageStatus,
} from '../utils';

const usageLabels = (
  colors: Colors,
): Record<UsageStatus, { text: string; color: string; bg: string }> => ({
  active: { text: '✓ 使ってる', color: colors.success, bg: colors.successSoft },
  stale: { text: '… 確認待ち', color: colors.warn, bg: colors.warnSoft },
  unused: { text: '✕ 使ってない', color: colors.danger, bg: colors.dangerSoft },
  unknown: { text: '? 未チェック', color: colors.subText, bg: colors.bg },
});

type Props = { item: Subscription; onPress: () => void };

export function SubscriptionRow({ item, onPress }: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const next = nextBillingDate(item);
  const days = daysUntil(next);
  const soon = days <= 3;
  const usage = usageLabels(colors)[usageStatus(item)];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <ServiceIcon name={item.name} category={item.category} />

      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.price} numberOfLines={1}>
          {item.plan ? `${item.plan}・` : ''}
          {item.cycle === 'monthly' ? '月額' : '年額'} {formatYen(item.price)}
        </Text>
        <View style={[styles.usage, { backgroundColor: usage.bg }]}>
          <Text style={[styles.usageText, { color: usage.color }]}>{usage.text}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.date}>{formatDate(next)}</Text>
        <View style={[styles.badge, soon && styles.badgeSoon]}>
          <Text style={[styles.badgeText, soon && styles.badgeTextSoon]}>
            {days === 0 ? '今日' : `あと${days}日`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      gap: 12,
    },
    main: { flex: 1 },
    name: { fontSize: 16, fontWeight: '700', color: colors.text },
    price: {
      fontSize: 13,
      color: colors.subText,
      marginTop: 2,
      fontVariant: ['tabular-nums'],
    },
    usage: {
      alignSelf: 'flex-start',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginTop: 5,
    },
    usageText: { fontSize: 11, fontWeight: '700' },
    right: { alignItems: 'flex-end', gap: 4 },
    date: { fontSize: 13, color: colors.subText, fontVariant: ['tabular-nums'] },
    badge: {
      backgroundColor: colors.bg,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    badgeSoon: { backgroundColor: colors.dangerSoft },
    badgeText: { fontSize: 12, fontWeight: '700', color: colors.subText },
    badgeTextSoon: { color: colors.danger },
  });
}
