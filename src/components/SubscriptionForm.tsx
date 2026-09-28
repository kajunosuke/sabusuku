import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CATEGORIES,
  PRICES_AS_OF,
  SERVICES,
  findService,
  type CategoryId,
  type Cycle,
  type Subscription,
} from '../types';
import { colors } from '../theme';
import { formatYen, newId } from '../utils';
import { ServiceIcon } from './ServiceIcon';

/** 種類タブ: サービスが登録されているカテゴリ + 「その他」（自分で入力） */
type TabId = CategoryId | 'custom';
const TABS: { id: TabId; label: string; emoji: string; color: string }[] = [
  ...CATEGORIES.filter((c) => SERVICES.some((s) => s.category === c.id)),
  { id: 'custom', label: '手入力', emoji: '✏️', color: colors.subText },
];

const TILE_WIDTH = 78;
const TILE_GAP = 10;

/** 検索用に表記ゆれをそろえる（大文字小文字・全角半角・カタカナ/ひらがな・空白） */
function normalize(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/\s/g, '');
}

/** 選択中のプラン: プランの番号 / 'custom'（金額を自分で入力） / null（未選択） */
type PlanChoice = number | 'custom' | null;

type Props = {
  initial?: Subscription;
  onSave: (sub: Subscription) => void;
  onDelete?: () => void;
  onCancel: () => void;
};

function initialPlanChoice(initial?: Subscription): PlanChoice {
  if (!initial) return null;
  const service = findService(initial.name);
  if (!service) return 'custom';
  const index = service.plans.findIndex(
    (p) =>
      p.price === initial.price &&
      p.cycle === initial.cycle &&
      (initial.plan === undefined || p.label === initial.plan),
  );
  return index >= 0 ? index : 'custom';
}

export function SubscriptionForm({ initial, onSave, onDelete, onCancel }: Props) {
  const today = new Date();
  const [tab, setTab] = useState<TabId>(() =>
    initial ? (findService(initial.name)?.category ?? 'custom') : 'video',
  );
  const [name, setName] = useState(initial?.name ?? '');
  const [planChoice, setPlanChoice] = useState<PlanChoice>(() => initialPlanChoice(initial));
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [cycle, setCycle] = useState<Cycle>(initial?.cycle ?? 'monthly');
  const [day, setDay] = useState(String(initial?.billingDay ?? today.getDate()));
  const [month, setMonth] = useState(String(initial?.billingMonth ?? today.getMonth() + 1));
  const [category, setCategory] = useState<CategoryId>(initial?.category ?? 'other');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [usage, setUsage] = useState(initial?.usage);
  const [query, setQuery] = useState('');

  const isCustom = tab === 'custom';
  const service = isCustom ? undefined : findService(name);
  const selectedPlan =
    service && typeof planChoice === 'number' ? service.plans[planChoice] : undefined;
  const hasPlans = !!service && service.plans.length > 0;
  const showManualPrice = isCustom || (!!service && (!hasPlans || planChoice === 'custom'));
  const effectiveCycle: Cycle = selectedPlan ? selectedPlan.cycle : cycle;

  const searching = query.trim() !== '';
  const tabServices = searching
    ? SERVICES.filter((s) => normalize(s.name).includes(normalize(query)))
    : isCustom
      ? []
      : SERVICES.filter((s) => s.category === tab);
  const selectedIndex = tabServices.findIndex((s) => s.name === name);

  const changeTab = (next: TabId) => {
    if (next === tab) return;
    setTab(next);
    setName('');
    setPlanChoice(null);
    setError('');
  };

  const selectService = (serviceName: string, serviceCategory: CategoryId) => {
    setTab(serviceCategory);
    setQuery('');
    setName(serviceName);
    setPlanChoice(null);
    setError('');
  };

  const handleSave = () => {
    const dayNum = Number(day);
    const monthNum = Number(month);
    if (!name.trim())
      return setError(isCustom ? 'サービス名を入力してください' : 'サービスを選んでください');

    let finalPrice: number;
    if (selectedPlan) {
      finalPrice = selectedPlan.price;
    } else if (hasPlans && planChoice === null) {
      return setError('プランを選んでください');
    } else {
      finalPrice = Number(price);
      if (!Number.isInteger(finalPrice) || finalPrice <= 0)
        return setError('金額を正しく入力してください');
    }

    if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 31)
      return setError('支払日は1〜31で入力してください');
    if (effectiveCycle === 'yearly' && (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12))
      return setError('支払月は1〜12で入力してください');

    onSave({
      id: initial?.id ?? newId(),
      createdAt: initial?.createdAt ?? Date.now(),
      name: name.trim(),
      price: finalPrice,
      cycle: effectiveCycle,
      plan: selectedPlan?.label,
      billingDay: dayNum,
      billingMonth:
        effectiveCycle === 'yearly' ? monthNum : initial?.billingMonth ?? today.getMonth() + 1,
      category: service ? service.category : category,
      usage,
      usageCheckedAt: usage === initial?.usage ? initial?.usageCheckedAt : Date.now(),
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return setConfirmDelete(true);
    onDelete?.();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={onCancel} hitSlop={12}>
          <Text style={styles.headerButton}>キャンセル</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{initial ? '編集' : 'サブスクを追加'}</Text>
        <Pressable onPress={handleSave} hitSlop={12}>
          <Text style={[styles.headerButton, styles.headerSave]}>保存</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <TextInput
          style={[styles.input, styles.search]}
          value={query}
          onChangeText={setQuery}
          placeholder="🔍 サービス名で検索"
          placeholderTextColor={colors.faint}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />

        {!searching && (
          <>
            <Text style={styles.sectionLabel}>種類</Text>
            <View style={styles.tabBar}>
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => changeTab(t.id)}
                    style={[styles.tab, active && { backgroundColor: t.color }]}
                  >
                    <Text style={styles.tabEmoji}>{t.emoji}</Text>
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {(!isCustom || searching) && (
          <>
            <Text style={styles.sectionLabel}>
              {searching ? `検索結果（${tabServices.length}件）` : 'サービス'}
            </Text>
            {searching && tabServices.length === 0 && (
              <Text style={styles.note}>見つかりませんでした。「手入力」タブから追加できます</Text>
            )}
            <ScrollView
              key={searching ? `search-${query}` : tab}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}
              contentOffset={{
                x: selectedIndex > 1 ? (selectedIndex - 1) * (TILE_WIDTH + TILE_GAP) : 0,
                y: 0,
              }}
            >
              {tabServices.map((s) => {
                const active = s.name === name;
                return (
                  <Pressable
                    key={s.name}
                    onPress={() => selectService(s.name, s.category)}
                    style={[styles.tile, active && styles.tileActive]}
                  >
                    <ServiceIcon name={s.name} category={s.category} size={48} />
                    <Text
                      style={[styles.tileName, active && styles.tileNameActive]}
                      numberOfLines={2}
                    >
                      {s.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => changeTab('custom')} hitSlop={8}>
              <Text style={styles.link}>一覧にないサービスを入力する ›</Text>
            </Pressable>
          </>
        )}

        {isCustom && !searching && (
          <>
            <Text style={styles.sectionLabel}>サービス名</Text>
            <View style={styles.nameRow}>
              <ServiceIcon name={name} category={category} size={48} />
              <TextInput
                style={[styles.input, styles.flex]}
                value={name}
                onChangeText={setName}
                placeholder="例: 新聞のデジタル版"
                placeholderTextColor={colors.faint}
              />
            </View>
          </>
        )}

        {service && !hasPlans && (
          <Text style={[styles.note, styles.manualNote]}>
            {service.name} は人や支援先によって金額が違うので、金額を入力してください
          </Text>
        )}

        {hasPlans && service && (
          <>
            <Text style={styles.sectionLabel}>{service.name} のプラン</Text>
            <View style={styles.planList}>
              {service.plans.map((p, i) => {
                const active = planChoice === i;
                return (
                  <Pressable
                    key={`${p.label}-${p.cycle}`}
                    onPress={() => {
                      setPlanChoice(i);
                      setError('');
                    }}
                    style={[styles.planItem, active && styles.planItemActive]}
                  >
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.planLabel} numberOfLines={1}>
                      {p.label}
                    </Text>
                    <View style={styles.cycleTag}>
                      <Text style={styles.cycleTagText}>
                        {p.cycle === 'monthly' ? '月額' : '年額'}
                      </Text>
                    </View>
                    <Text style={[styles.planPrice, active && { color: colors.primary }]}>
                      {formatYen(p.price)}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => {
                  setPlanChoice('custom');
                  setError('');
                }}
                style={[styles.planItem, planChoice === 'custom' && styles.planItemActive]}
              >
                <View style={[styles.radio, planChoice === 'custom' && styles.radioActive]}>
                  {planChoice === 'custom' && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.planLabel, { color: colors.subText }]}>
                  その他の金額（自分で入力）
                </Text>
              </Pressable>
            </View>
            <Text style={styles.note}>
              ※料金は{PRICES_AS_OF}時点の目安です。実際と違う場合は「その他の金額」を選んでください
            </Text>
          </>
        )}

        {showManualPrice && (
          <>
            <Text style={styles.sectionLabel}>支払いサイクル</Text>
            <View style={styles.segment}>
              {(['monthly', 'yearly'] as const).map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCycle(c)}
                  style={[styles.segmentItem, cycle === c && styles.segmentItemActive]}
                >
                  <Text style={[styles.segmentText, cycle === c && styles.segmentTextActive]}>
                    {c === 'monthly' ? '月額' : '年額'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>金額</Text>
            <View style={styles.inputWithUnit}>
              <Text style={styles.unit}>¥</Text>
              <TextInput
                style={[styles.input, styles.flex]}
                value={price}
                onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
                placeholder="980"
                placeholderTextColor={colors.faint}
                keyboardType="number-pad"
              />
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>支払日</Text>
        <View style={styles.dateRow}>
          {effectiveCycle === 'yearly' && (
            <>
              <Text style={styles.dateText}>毎年</Text>
              <TextInput
                style={[styles.input, styles.smallInput]}
                value={month}
                onChangeText={(t) => setMonth(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.dateText}>月</Text>
            </>
          )}
          {effectiveCycle === 'monthly' && <Text style={styles.dateText}>毎月</Text>}
          <TextInput
            style={[styles.input, styles.smallInput]}
            value={day}
            onChangeText={(t) => setDay(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.dateText}>日</Text>
        </View>

        {isCustom && (
          <>
            <Text style={styles.sectionLabel}>カテゴリ</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategory(c.id)}
                    style={[
                      styles.categoryItem,
                      active && { borderColor: c.color, backgroundColor: c.color + '14' },
                    ]}
                  >
                    <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                    <Text style={[styles.categoryLabel, active && { color: c.color }]}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>最近使ってる？</Text>
        <View style={styles.usageRow}>
          {(
            [
              { id: 'used', label: '👍 使ってる', color: colors.success, bg: colors.successSoft },
              { id: 'unused', label: '👎 使ってない', color: colors.danger, bg: colors.dangerSoft },
            ] as const
          ).map((u) => {
            const active = usage === u.id;
            return (
              <Pressable
                key={u.id}
                onPress={() => setUsage(active ? undefined : u.id)}
                style={[
                  styles.usageItem,
                  active && { backgroundColor: u.bg, borderColor: u.color },
                ]}
              >
                <Text style={[styles.usageText, active && { color: u.color }]}>{u.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.saveButtonText}>保存する</Text>
        </Pressable>

        {initial && onDelete && (
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              confirmDelete && styles.deleteButtonConfirm,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.deleteText, confirmDelete && { color: '#fff' }]}>
              {confirmDelete ? 'もう一度タップで削除します' : 'このサブスクを削除'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  headerButton: { fontSize: 16, color: colors.primary },
  headerSave: { fontWeight: '700' },
  body: { padding: 16, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.subText,
    marginTop: 18,
    marginBottom: 8,
  },
  search: { marginTop: 4 },
  manualNote: { marginTop: 16 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 14,
    padding: 3,
    gap: 3,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 11 },
  tabEmoji: { fontSize: 18 },
  tabText: { fontSize: 11, fontWeight: '700', color: colors.subText, marginTop: 2 },
  tabTextActive: { color: '#fff' },
  carousel: { marginHorizontal: -16 },
  carouselContent: { gap: TILE_GAP, paddingHorizontal: 16, paddingVertical: 2 },
  tile: {
    width: TILE_WIDTH,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tileActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  tileName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
    minHeight: 28,
  },
  tileNameActive: { color: colors.primary, fontWeight: '800' },
  link: { color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planList: { gap: 8 },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  planItemActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  planLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  cycleTag: {
    backgroundColor: colors.bg,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cycleTagText: { fontSize: 11, fontWeight: '700', color: colors.subText },
  planPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    minWidth: 64,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  note: { fontSize: 12, color: colors.subText, marginTop: 8 },
  inputWithUnit: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unit: { fontSize: 20, fontWeight: '700', color: colors.subText },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 3,
  },
  segmentItem: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segmentItemActive: { backgroundColor: colors.card },
  segmentText: { fontSize: 15, color: colors.subText, fontWeight: '600' },
  segmentTextActive: { color: colors.text, fontWeight: '700' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 16, color: colors.text },
  smallInput: { width: 64, textAlign: 'center' },
  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  categoryEmoji: { fontSize: 20 },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: colors.subText, marginTop: 2 },
  usageRow: { flexDirection: 'row', gap: 8 },
  usageItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  usageText: { fontSize: 15, fontWeight: '700', color: colors.subText },
  error: { color: colors.danger, marginTop: 16, fontSize: 14, fontWeight: '600' },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  deleteButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: colors.dangerSoft,
  },
  deleteButtonConfirm: { backgroundColor: colors.danger },
  deleteText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
});
