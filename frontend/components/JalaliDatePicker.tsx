"use client";

import { parseISO } from "date-fns-jalali";
import { useEffect, useRef } from "react";
import persian from "react-date-object/calendars/persian";
import persian_en from "react-date-object/locales/persian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker, { type DatePickerRef } from "react-multi-date-picker";
import { useT } from "@/lib/i18n";
import { toISODate } from "@/lib/utils";
import { CloseIcon } from "./ui";

export default function JalaliDatePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { t, language } = useT();
  const picker = useRef<DatePickerRef>(null);

  // Esc closes an open calendar first; without this the surrounding modal would close and lose the form.
  useEffect(() => {
    const dialog = picker.current?.closest("dialog");
    const onCancel = (e: Event) => {
      if (!picker.current?.isOpen) return;
      e.preventDefault();
      picker.current.closeCalendar();
    };
    dialog?.addEventListener("cancel", onCancel);
    return () => dialog?.removeEventListener("cancel", onCancel);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <DatePicker
        ref={picker}
        value={value ? parseISO(value) : null}
        onChange={(date) => {
          onChange(date ? toISODate(date.toDate()) : null);
          picker.current?.closeCalendar();
        }}
        calendar={persian}
        locale={language === "fa" ? persian_fa : persian_en}
        format="D MMMM YYYY"
        onOpenPickNewDate={false}
        calendarPosition="top-start"
        className={language === "fa" ? "rmdp-rtl" : undefined}
        containerClassName="flex-1"
        render={(text: string, openCalendar: () => void) => (
          <input
            readOnly
            value={text}
            aria-label={t.due}
            placeholder={t.dialog.setDue}
            onFocus={openCalendar}
            onClick={openCalendar}
            className="h-9 w-full cursor-pointer rounded-lg border border-surface-border bg-surface-hover px-2.5 text-[13px] text-ink placeholder:text-muted"
          />
        )}
      />
      {value && (
        <button
          type="button"
          aria-label={t.dialog.clearDue}
          title={t.dialog.clearDue}
          onClick={() => onChange(null)}
          className="grid size-9 flex-none place-items-center rounded-lg text-muted transition-colors hover:bg-ghost-hover hover:text-ink"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}
