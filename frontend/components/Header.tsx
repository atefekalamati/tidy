"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { toISODate } from "@/lib/utils";
import { Avatar, BoardIcon, ChatIcon, Segmented, SegmentButton, cx } from "./ui";

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

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cx(
        "flex h-9 items-center gap-[7px] rounded-[7px] px-3 text-[13px] font-semibold transition-colors",
        active ? "bg-surface-hover text-heading shadow-segment" : "text-muted",
      )}
    >
      {children}
    </button>
  );
}

export default function Header() {
  const { t, n, language } = useT();
  const view = useStore((s) => s.view);
  const density = useStore((s) => s.density);
  const members = useStore((s) => s.members);
  const unread = useStore((s) => Object.values(s.unread).reduce((sum, x) => sum + x, 0));
  const setView = useStore((s) => s.setView);
  const setLanguage = useStore((s) => s.setLanguage);
  const setDensity = useStore((s) => s.setDensity);
  const openDialog = useStore((s) => s.openDialog);
  const isBoard = view === "board";

  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-3.5 border-b border-hairline bg-chrome px-8 py-3.5">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-[34px] place-items-center rounded-[9px] bg-primary text-white shadow-[0_4px_12px_rgba(47,111,168,.25)]">
          <BoardIcon size={18} />
        </span>
        <div>
          <h1 className="font-brand text-[22px]/7 font-bold tracking-[-0.03em] text-heading">
            <span dir="ltr">
              Tidy<span aria-hidden className="text-primary">.</span>
            </span>
          </h1>
          <p className="text-[12px]/4 text-muted">{t.appSub}</p>
        </div>
      </div>

      <nav aria-label={t.navLabel} className="flex gap-0.5 rounded-[10px] border border-segment-border bg-segment p-[3px]">
        <NavButton active={isBoard} onClick={() => setView("board")}>
          <BoardIcon size={15} />
          {t.board}
        </NavButton>
        <NavButton active={!isBoard} onClick={() => setView("chat")}>
          <ChatIcon size={15} />
          {t.chat}
          {unread > 0 && (
            <span
              data-testid="unread-badge"
              title={t.unread}
              className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-unread px-[5px] text-[11px] font-semibold text-white"
            >
              {n(unread)}
            </span>
          )}
        </NavButton>
      </nav>

      {isBoard && <Summary />}

      <div className="ms-auto flex items-center gap-2.5">
        <Segmented label={t.langLabel}>
          <SegmentButton active={language === "en"} onClick={() => setLanguage("en")} className="font-brand">
            EN
          </SegmentButton>
          <SegmentButton active={language === "fa"} onClick={() => setLanguage("fa")} className="[font-family:var(--font-vazirmatn)]">
            فا
          </SegmentButton>
        </Segmented>
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
        <div role="group" aria-label={t.teamLabel} className="flex items-center ps-1.5">
          {Object.values(members).map((m) => (
            <Avatar key={m.id} member={m} className="-ms-1.5 ring-2 ring-chrome" />
          ))}
        </div>
      </div>
    </header>
  );
}
