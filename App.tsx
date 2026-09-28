import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubscriptionForm } from './src/components/SubscriptionForm';
import { SubscriptionRow } from './src/components/SubscriptionRow';
import { SummaryCard } from './src/components/SummaryCard';
import { UnusedCard } from './src/components/UnusedCard';
import { UsageCheckCard } from './src/components/UsageCheckCard';
import { loadSubscriptions, saveSubscriptions } from './src/storage';
import { colors } from './src/theme';
import type { Subscription } from './src/types';
import { monthlyAmount, needsUsageCheck, nextBillingDate, usageStatus } from './src/utils';

type SortKey = 'date' | 'price';
type Editing = { mode: 'new' } | { mode: 'edit'; sub: Subscription } | null;

export default function App() {
  return (
    <SafeAreaProvider>
      <Home />
    </SafeAreaProvider>
  );
}

function Home() {
  const insets = useSafeAreaInsets();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [editing, setEditing] = useState<Editing>(null);
  /** 「あとで」を押したサブスク（アプリを開き直すとまた聞く） */
  const [skipped, setSkipped] = useState<string[]>([]);

  useEffect(() => {
    loadSubscriptions().then((list) => {
      setSubs(list);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveSubscriptions(subs);
  }, [subs, loaded]);

  const sorted = useMemo(() => {
    const list = [...subs];
    if (sortKey === 'date') {
      list.sort((a, b) => nextBillingDate(a).getTime() - nextBillingDate(b).getTime());
    } else {
      list.sort((a, b) => monthlyAmount(b) - monthlyAmount(a));
    }
    return list;
  }, [subs, sortKey]);

  // 金額の大きいものから順に「最近使ってる？」を聞く
  const checkQueue = useMemo(
    () =>
      subs
        .filter((s) => needsUsageCheck(s) && !skipped.includes(s.id))
        .sort((a, b) => monthlyAmount(b) - monthlyAmount(a)),
    [subs, skipped],
  );

  const unused = useMemo(() => subs.filter((s) => usageStatus(s) === 'unused'), [subs]);

  const handleAnswer = (id: string, answer: 'used' | 'unused') => {
    setSubs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, usage: answer, usageCheckedAt: Date.now() } : s)),
    );
  };

  const handleSave = (sub: Subscription) => {
    setSubs((prev) =>
      prev.some((s) => s.id === sub.id) ? prev.map((s) => (s.id === sub.id ? sub : s)) : [...prev, sub],
    );
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setSubs((prev) => prev.filter((s) => s.id !== id));
    setEditing(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <FlatList
        data={sorted}
        keyExtractor={(s) => s.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>サブスク管理</Text>
            <SummaryCard subscriptions={subs} />
            {checkQueue.length > 0 && (
              <UsageCheckCard
                sub={checkQueue[0]}
                remaining={checkQueue.length}
                onAnswer={(answer) => handleAnswer(checkQueue[0].id, answer)}
                onSkip={() => setSkipped((prev) => [...prev, checkQueue[0].id])}
              />
            )}
            {unused.length > 0 && (
              <UnusedCard
                subscriptions={unused}
                onPress={(sub) => setEditing({ mode: 'edit', sub })}
              />
            )}
            {subs.length > 0 && (
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>契約中のサービス</Text>
                <View style={styles.sortToggle}>
                  {(['date', 'price'] as const).map((k) => (
                    <Pressable
                      key={k}
                      onPress={() => setSortKey(k)}
                      style={[styles.sortItem, sortKey === k && styles.sortItemActive]}
                    >
                      <Text style={[styles.sortText, sortKey === k && styles.sortTextActive]}>
                        {k === 'date' ? '支払日順' : '金額順'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          loaded ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🧾</Text>
              <Text style={styles.emptyTitle}>まだサブスクがありません</Text>
              <Text style={styles.emptyText}>右下の「＋」から追加してみましょう</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <SubscriptionRow item={item} onPress={() => setEditing({ mode: 'edit', sub: item })} />
        )}
      />

      <Pressable
        onPress={() => setEditing({ mode: 'new' })}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 24 },
          pressed && { transform: [{ scale: 0.94 }] },
        ]}
        accessibilityLabel="サブスクを追加"
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <Modal
        visible={editing !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditing(null)}
      >
        {editing && (
          <SubscriptionForm
            key={editing.mode === 'edit' ? editing.sub.id : 'new'}
            initial={editing.mode === 'edit' ? editing.sub : undefined}
            onSave={handleSave}
            onDelete={editing.mode === 'edit' ? () => handleDelete(editing.sub.id) : undefined}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 16, marginTop: 8 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sortToggle: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: 10, padding: 2 },
  sortItem: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  sortItemActive: { backgroundColor: colors.card },
  sortText: { fontSize: 12, color: colors.subText, fontWeight: '600' },
  sortTextActive: { color: colors.text, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 12 },
  emptyText: { fontSize: 14, color: colors.subText, marginTop: 6 },
  fab: {
    position: 'absolute',
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 30, fontWeight: '600', marginTop: -2 },
});
