"use client";

import { useT } from "@/lib/i18n";
import Dialog from "./Dialog";

export default function HelpDialog() {
  const { t } = useT();
  const s = t.shortcutList;
  const rows: [string, string[]][] = [
    [s.newCard, ["N"]],
    [s.openRoom, ["Enter"]],
    [s.moveCard, [",", "."]],
    [s.deleteCard, ["Del"]],
    [s.goChat, ["G", "C"]],
    [s.goBoard, ["G", "B"]],
    [s.language, ["L"]],
    [s.help, ["?"]],
    [s.close, ["Esc"]],
  ];

  return (
    <Dialog title={t.shortcuts} className="mt-24 w-[calc(100%-40px)] max-w-[420px]">
      <div className="flex flex-col">
        {rows.map(([label, keys]) => (
          <div key={label} className="flex items-center justify-between gap-3 border-b border-rule py-[9px]">
            <span className="text-[13px] text-ink">{label}</span>
            <span dir="ltr" className="flex gap-1">
              {keys.map((key) => (
                <kbd
                  key={key}
                  className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-b-2 border-selected-ring bg-column px-1.5 font-mono text-[11px] font-medium text-heading"
                >
                  {key}
                </kbd>
              ))}
            </span>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
