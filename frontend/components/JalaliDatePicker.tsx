"use client";

import { format, getDate, getDaysInMonth, getMonth, getYear, newDate, parseISO } from "date-fns-jalali";
import { useT } from "@/lib/i18n";
import { jalaliLocale, toISODate } from "@/lib/utils";
import { CloseIcon } from "./ui";

const selectClass = "h-9 min-w-0 rounded-lg border border-surface-border bg-surface-hover px-1.5 text-[13px] text-ink";

export default function JalaliDatePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { t, n, language } = useT();

  if (!value) {
    return (
      <button
        type="button"
        onClick={() => onChange(toISODate(new Date()))}
        className="h-9 w-fit rounded-lg border border-dashed border-dashed-line px-3 text-[12.5px] font-medium text-primary transition-colors hover:bg-ghost-hover"
      >
        {t.dialog.setDue}
      </button>
    );
  }

  const date = parseISO(value);
  const year = getYear(date);
  const month = getMonth(date);
  const day = getDate(date);
  const thisYear = getYear(new Date());
  const years = [...new Set([year, thisYear, thisYear + 1, thisYear + 2])].sort((a, b) => a - b);
  const dayCount = getDaysInMonth(newDate(year, month, 1));

  // Clamp the day so that moving from a 31-day month never spills into the next month.
  const update = (y: number, m: number, d: number) => {
    const last = getDaysInMonth(newDate(y, m, 1));
    onChange(toISODate(newDate(y, m, Math.min(d, last))));
  };

  return (
    <div className="flex items-center gap-1.5">
      <select aria-label={t.dialog.day} className={selectClass} value={day} onChange={(e) => update(year, month, Number(e.target.value))}>
        {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            {n(d)}
          </option>
        ))}
      </select>
      <select aria-label={t.dialog.month} className={selectClass} value={month} onChange={(e) => update(year, Number(e.target.value), day)}>
        {Array.from({ length: 12 }, (_, m) => (
          <option key={m} value={m}>
            {format(newDate(1405, m, 1), "MMMM", { locale: jalaliLocale(language) })}
          </option>
        ))}
      </select>
      <select aria-label={t.dialog.year} className={selectClass} value={year} onChange={(e) => update(Number(e.target.value), month, day)}>
        {years.map((y) => (
          <option key={y} value={y}>
            {n(y)}
          </option>
        ))}
      </select>
      <button
        type="button"
        aria-label={t.dialog.clearDue}
        title={t.dialog.clearDue}
        onClick={() => onChange(null)}
        className="grid size-9 flex-none place-items-center rounded-lg text-muted transition-colors hover:bg-ghost-hover hover:text-ink"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}
