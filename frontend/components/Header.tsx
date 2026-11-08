"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { toISODate } from "@/lib/utils";
import { Avatar, PlusIcon, Segmented, SegmentButton } from "./ui";

function Stat({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-segment-border bg-segment px-2.5 text-[12px] font-medium text-secondary">
      {children}
    </span>
  );
}

function Summary() {
  const { t, n, pct } = useT();
  const cards = useStore((s) => s.cards);
  const columns = useStore((s) => s.columns);
  const done = columns.find((c) => c.id === "done")!.cardIds;
  const all = Object.values(cards);
  const today = toISODate(new Date());
  const overdue = all.filter((c) => c.dueDate && c.dueDate < today && !done.includes(c.id)).length;
  const percent = all.length ? Math.round((done.length / all.length) * 100) : 0;

  return (
    <div role="group" aria-label={t.summaryLabel} data-testid="summary" className="flex flex-wrap items-center gap-2">
      <Stat>{t.cardCount(n(all.length))}</Stat>
      <Stat>
        <span aria-hidden className="size-[7px] rounded-full bg-overdue-dot" />
        {t.overdueCount(n(overdue))}
      </Stat>
      <Stat>
        <span aria-hidden className="flex h-[5px] w-[72px] overflow-hidden rounded-full bg-track-summary">
          <span className="rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </span>
        {t.donePercent(pct(percent))}
      </Stat>
    </div>
  );
}

export default function Header() {
  const { t, L } = useT();
  const isBoard = useStore((s) => s.view === "board");
  const density = useStore((s) => s.density);
  const members = useStore((s) => s.members);
  const room = useStore((s) => s.cards[s.activeSpace]);
  const setDensity = useStore((s) => s.setDensity);
  const openDialog = useStore((s) => s.openDialog);
  const crumb = isBoard ? t.crumbBoard : room ? L(room.title) : `# ${t.general}`;

  return (
    <header className="flex min-h-16 flex-wrap items-center gap-x-5 gap-y-3 border-b border-hairline bg-chrome px-7 py-3">
      <nav aria-label={t.crumbLabel} className="flex min-w-0 items-center gap-2 text-[13px]">
        <span className="text-muted">{t.workspace}</span>
        <span aria-hidden className="text-crumb-separator">
          /
        </span>
        <span aria-current="page" dir="auto" className="truncate font-semibold text-heading">
          {crumb}
        </span>
      </nav>

      {isBoard && <Summary />}

      <div className="ms-auto flex items-center gap-2.5">
        <div role="group" aria-label={t.teamLabel} className="flex items-center ps-1.5">
          {Object.values(members).map((m) => (
            <Avatar key={m.id} member={m} className="-ms-1.5 ring-2 ring-chrome" />
          ))}
        </div>
        {isBoard && (
          <Segmented label={t.densityLabel}>
            <SegmentButton active={density === "comfortable"} onClick={() => setDensity("comfortable")}>
              {t.comfy}
            </SegmentButton>
            <SegmentButton active={density === "compact"} onClick={() => setDensity("compact")}>
              {t.compact}
            </SegmentButton>
          </Segmented>
        )}
        <button
          type="button"
          aria-label={t.shortcuts}
          onClick={() => openDialog({ type: "help" })}
          className="size-9 rounded-[9px] border border-segment-border text-[14px] font-semibold text-secondary transition-colors hover:bg-ghost-hover hover:text-ink"
        >
          ?
        </button>
        <button
          type="button"
          onClick={() => openDialog({ type: "card", columnId: "todo" })}
          className="flex h-9 items-center gap-1.5 rounded-[9px] bg-primary px-3.5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(47,111,168,.22)] transition-colors hover:bg-primary-hover"
        >
          <PlusIcon size={15} />
          {t.newCard}
        </button>
      </div>
    </header>
  );
}
