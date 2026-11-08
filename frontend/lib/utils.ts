import { addDays, format, parseISO } from "date-fns-jalali";
import { enUS, faIR } from "date-fns-jalali/locale";
import type { Language } from "./types";

export function toPersianDigits(text: string): string {
  return text.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function formatNumber(value: number | string, language: Language): string {
  return language === "fa" ? toPersianDigits(String(value)) : String(value);
}

export function formatPercent(value: number, language: Language): string {
  return language === "fa" ? `${toPersianDigits(String(value))}٪` : `${value}%`;
}

/** "18 Aban" or "۱۸ آبان". */
export function formatJalaliDay(isoDate: string, language: Language): string {
  return formatNumber(format(parseISO(isoDate), "d MMMM", { locale: language === "fa" ? faIR : enUS }), language);
}

export function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function currentTime(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export type DueState = "overdue" | "today" | "tomorrow" | "later" | "done";

export function dueState(isoDate: string, done: boolean, now = new Date()): DueState {
  if (done) return "done";
  const today = toISODate(now);
  if (isoDate < today) return "overdue";
  if (isoDate === today) return "today";
  return isoDate === toISODate(addDays(now, 1)) ? "tomorrow" : "later";
}

/** Moves keyboard focus to a card once React has rendered its new position. */
export function focusCard(cardId: string | undefined) {
  if (!cardId) return;
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(`[data-card-id="${cardId}"] [data-card-open]`)?.focus();
  });
}
