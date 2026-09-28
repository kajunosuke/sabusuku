import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Subscription } from '../types';
import { useColors, type Colors } from '../theme';
import { billingDateInMonth, formatYen } from '../utils';
import { ServiceIcon } from './ServiceIcon';

type Props = {
  subscriptions: Subscription[];
  onPressSub: (sub: Subscription) => void;
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const SUNDAY_COLOR = '#E5484D';
const SATURDAY_COLOR = '#0090FF';
/** 1日のマスに並べるアイコンの数（それ以上は「+N」） */
const MAX_ICONS = 2;

/** 支払日にサービスのアイコンを並べた月カレンダー */
export function PaymentCalendar({ subscriptions, onPressSub }: Props) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const today = new Date();
  const [month, setMonth] = useState({ year: today.getFullYear(), index: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  // 日付 → その日に支払うサブスク（金額の大きい順）
  const byDay = useMemo(() => {
    const map = new Map<number, Subscription[]>();
    for (const s of subscriptions) {
      const date = billingDateInMonth(s, month.year, month.index);
      if (!date) continue;
      const list = map.get(date.getDate()) ?? [];
      list.push(s);
      map.set(date.getDate(), list);
    }
    for (const list of map.values()) list.sort((a, b) => b.price - a.price);
    return map;
  }, [subscriptions, month]);

  const payments = [...byDay.values()].flat();
  const monthTotal = payments.reduce((sum, s) => sum + s.price, 0);

  const firstWeekday = new Date(month.year, month.index, 1).getDay();
  const daysInMonth = new Date(month.year, month.index + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  const isThisMonth = month.year === today.getFullYear() && month.index === today.getMonth();

  const moveMonth = (delta: number) => {
    const d = new Date(month.year, month.index + delta, 1);
    setMonth({ year: d.getFullYear(), index: d.getMonth() });
    const isCurrent = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    setSelectedDay(isCurrent ? today.getDate() : null);
  };

  const selected = selectedDay ? (byDay.get(selectedDay) ?? []) : [];
  const selectedWeekday =
    selectedDay !== null ? WEEKDAYS[new Date(month.year, month.index, selectedDay).getDay()] : '';

  return (
    <View>
      <View style={styles.monthHeader}>
        <Pressable onPress={() => moveMonth(-1)} hitSlop={12} accessibilityLabel="前の月">
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>
          {month.year}年{month.index + 1}月
        </Text>
        <Pressable onPress={() => moveMonth(1)} hitSlop={12} accessibilityLabel="次の月">
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>
      <Text style={styles.monthSummary}>
        この月の支払い <Text style={styles.monthTotal}>{formatYen(monthTotal)}</Text>・
        {payments.length}件
      </Text>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text
            key={w}
            style={[
              styles.weekday,
              i === 0 && { color: SUNDAY_COLOR },
              i === 6 && { color: SATURDAY_COLOR },
            ]}
          >
            {w}
          </Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            if (day === null) return <View key={di} style={styles.cell} />;
            const subs = byDay.get(day) ?? [];
            const isSelected = day === selectedDay;
            const isToday = isThisMonth && day === today.getDate();
            return (
              <Pressable
                key={di}
                onPress={() => setSelectedDay(day)}
                style={[
                  styles.cell,
                  subs.length > 0 && styles.cellWithPayment,
                  isSelected && styles.cellSelected,
                ]}
              >
                <View style={[styles.dayBadge, isToday && styles.todayBadge]}>
                  <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
                </View>
                <View style={styles.icons}>
                  {subs.slice(0, MAX_ICONS).map((s) => (
                    <ServiceIcon key={s.id} name={s.name} category={s.category} size={15} />
                  ))}
                  {subs.length > MAX_ICONS && (
                    <Text style={styles.more}>+{subs.length - MAX_ICONS}</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}

      {selectedDay !== null && (
        <View style={styles.dayList}>
          <Text style={styles.dayListTitle}>
            {month.index + 1}月{selectedDay}日（{selectedWeekday}）の支払い
            {selected.length > 0 && `　${formatYen(selected.reduce((sum, s) => sum + s.price, 0))}`}
          </Text>
          {selected.length === 0 && <Text style={styles.noPayment}>この日の支払いはありません</Text>}
          {selected.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => onPressSub(s)}
              style={({ pressed }) => [styles.payRow, pressed && { opacity: 0.6 }]}
            >
              <ServiceIcon name={s.name} category={s.category} size={32} />
              <View style={styles.payMain}>
                <Text style={styles.payName} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text style={styles.payPlan} numberOfLines={1}>
                  {s.plan ? `${s.plan}・` : ''}
                  {s.cycle === 'monthly' ? '月額' : '年額'}
                </Text>
              </View>
              <Text style={styles.payPrice}>{formatYen(s.price)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    monthHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
    },
    arrow: { fontSize: 28, color: colors.primary, fontWeight: '600', lineHeight: 32 },
    monthTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
    monthSummary: {
      textAlign: 'center',
      fontSize: 13,
      color: colors.subText,
      marginTop: 2,
      marginBottom: 12,
    },
    monthTotal: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    weekRow: { flexDirection: 'row', gap: 3, marginBottom: 3 },
    weekday: {
      flex: 1,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '600',
      color: colors.subText,
      paddingVertical: 4,
    },
    cell: {
      flex: 1,
      height: 48,
      borderRadius: 9,
      alignItems: 'center',
      paddingTop: 4,
      gap: 4,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    cellWithPayment: { backgroundColor: colors.card },
    cellSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
    dayBadge: { borderRadius: 8, paddingHorizontal: 5 },
    todayBadge: { backgroundColor: colors.primary },
    dayText: { fontSize: 12, fontWeight: '600', color: colors.text, lineHeight: 16 },
    todayText: { color: '#fff' },
    icons: { flexDirection: 'row', alignItems: 'center', gap: 1 },
    more: { fontSize: 9, fontWeight: '700', color: colors.subText, marginLeft: 1 },
    dayList: { marginTop: 14 },
    dayListTitle: { fontSize: 13, fontWeight: '700', color: colors.subText, marginBottom: 8 },
    noPayment: { fontSize: 13, color: colors.faint, paddingVertical: 8 },
    payRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
    },
    payMain: { flex: 1 },
    payName: { fontSize: 15, fontWeight: '700', color: colors.text },
    payPlan: { fontSize: 12, color: colors.subText, marginTop: 2 },
    payPrice: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
  });
}
