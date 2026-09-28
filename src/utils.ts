import type { Subscription } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function monthlyAmount(s: Subscription): number {
  return s.cycle === 'monthly' ? s.price : s.price / 12;
}

export function yearlyAmount(s: Subscription): number {
  return s.cycle === 'monthly' ? s.price * 12 : s.price;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 指定月の day 日。月末を超える場合は月末に丸める（例: 31日払い → 2月は28日） */
function dateInMonth(year: number, monthIndex: number, day: number): Date {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return new Date(year, monthIndex, Math.min(day, lastDay));
}

export function nextBillingDate(s: Subscription, today: Date = new Date()): Date {
  const t = startOfDay(today);
  if (s.cycle === 'monthly') {
    const thisMonth = dateInMonth(t.getFullYear(), t.getMonth(), s.billingDay);
    return thisMonth >= t
      ? thisMonth
      : dateInMonth(t.getFullYear(), t.getMonth() + 1, s.billingDay);
  }
  const thisYear = dateInMonth(t.getFullYear(), s.billingMonth - 1, s.billingDay);
  return thisYear >= t
    ? thisYear
    : dateInMonth(t.getFullYear() + 1, s.billingMonth - 1, s.billingDay);
}

/** 指定した月の支払日。その月に支払いがなければ null（年額は支払月だけ） */
export function billingDateInMonth(
  s: Subscription,
  year: number,
  monthIndex: number,
): Date | null {
  if (s.cycle === 'yearly' && s.billingMonth - 1 !== monthIndex) return null;
  return dateInMonth(year, monthIndex, s.billingDay);
}

export function daysUntil(date: Date, today: Date = new Date()): number {
  return Math.round((startOfDay(date).getTime() - startOfDay(today).getTime()) / DAY_MS);
}

/** 「使ってる」と答えてから、もう一度聞くまでの日数 */
export const RECHECK_DAYS = 14;

/**
 * 利用状況
 * - active: 最近「使ってる」と答えた
 * - stale: 「使ってる」と答えてから時間がたった（もう一度聞く）
 * - unused: 「使ってない」と答えた（解約候補）
 * - unknown: まだ聞いていない
 */
export type UsageStatus = 'active' | 'stale' | 'unused' | 'unknown';

export function daysSince(timestamp: number, today: Date = new Date()): number {
  return -daysUntil(new Date(timestamp), today);
}

export function usageStatus(s: Subscription, today: Date = new Date()): UsageStatus {
  if (!s.usage || !s.usageCheckedAt) return 'unknown';
  if (s.usage === 'unused') return 'unused';
  return daysSince(s.usageCheckedAt, today) > RECHECK_DAYS ? 'stale' : 'active';
}

export function needsUsageCheck(s: Subscription, today: Date = new Date()): boolean {
  const status = usageStatus(s, today);
  return status === 'unknown' || status === 'stale';
}

export function formatYen(amount: number): string {
  const rounded = Math.round(amount).toString();
  return '¥' + rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDate(d: Date): string {
  const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${w})`;
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
