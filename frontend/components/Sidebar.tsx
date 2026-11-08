"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { columnOf, useStore } from "@/lib/store";
import type { Card } from "@/lib/types";
import { CURRENT_USER_ID, GENERAL_SPACE } from "@/data/seed";
import { Avatar, BoardIcon, ChatIcon, ChevronDownIcon, DotsIcon, Segmented, SegmentButton, cx } from "./ui";

const activeItem = "bg-column shadow-[inset_0_0_0_1px_var(--color-selected-ring)]";
const spaceButton = (active: boolean) =>
  cx(
    "flex w-full items-start gap-2.5 rounded-[10px] px-2.5 py-2 text-start transition-colors",
    active ? activeItem : "hover:bg-space-hover",
  );
const sectionTitle = "px-2.5 pb-1.5 text-[11px] font-semibold tracking-[.04em] text-muted";

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cx(
        "flex h-10 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-start text-[13.5px] font-semibold transition-colors",
        active ? cx(activeItem, "text-heading") : "text-secondary hover:bg-space-hover",
      )}
    >
      {children}
    </button>
  );
}

function RoomButton({ card }: { card: Card }) {
  const { t, n, pct, L } = useT();
  const active = useStore((s) => s.view === "chat" && s.activeSpace === card.id);
  const columnId = useStore((s) => columnOf(s.columns, card.id).id);
  const openRoom = useStore((s) => s.openRoom);
  const progress = columnId === "done" ? 100 : card.progress;

  return (
    <button
      type="button"
      data-testid="room"
      aria-current={active || undefined}
      onClick={() => openRoom(card.id)}
      className={spaceButton(active)}
    >
      <span aria-hidden className="mt-1.5 size-2 flex-none rounded-full" style={{ backgroundColor: `var(--accent-${columnId})` }} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span dir="auto" className="truncate text-[13px] font-medium text-ink">
          {L(card.title)}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="flex h-1 w-11 overflow-hidden rounded-full bg-column">
            <span className="bg-primary" style={{ width: `${progress}%` }} />
          </span>
          <span className="text-[11px] text-muted">
            {pct(progress)} · {t.memberCount(n(card.memberIds.length))}
          </span>
        </span>
      </span>
    </button>
  );
}

export default function Sidebar() {
  const { t, n, L, language } = useT();
  const isBoard = useStore((s) => s.view === "board");
  const generalActive = useStore((s) => s.view === "chat" && s.activeSpace === GENERAL_SPACE);
  const cards = useStore((s) => s.cards);
  const me = useStore((s) => s.members[CURRENT_USER_ID]);
  const unread = useStore((s) => Object.values(s.unread).reduce((sum, x) => sum + x, 0));
  const setView = useStore((s) => s.setView);
  const setLanguage = useStore((s) => s.setLanguage);
  const openRoom = useStore((s) => s.openRoom);

  return (
    <aside aria-label={t.sidebarLabel} className="flex h-full w-64 flex-none flex-col border-e border-hairline bg-chrome">
      <div className="flex items-center gap-2.5 px-[18px] pb-4 pt-5">
        <span aria-hidden className="grid size-[34px] place-items-center rounded-[9px] bg-primary text-white shadow-[0_4px_12px_rgba(47,111,168,.25)]">
          <BoardIcon size={18} />
        </span>
        <h1 dir="ltr" className="font-brand text-[22px]/7 font-bold tracking-[-0.03em] text-heading">
          Tidy<span aria-hidden className="text-primary">.</span>
        </h1>
        <span className="ms-auto inline-flex h-5 items-center rounded-md border border-segment-border bg-segment px-[7px] text-[10.5px] font-semibold tracking-[.04em] text-muted">
          {t.wsBadge}
        </span>
      </div>

      <div className="px-3.5">
        {/* Display only: there is one workspace, so this is deliberately not a button. */}
        <div data-testid="workspace" className="flex items-center gap-2.5 rounded-xl border border-segment-border bg-surface p-2.5 shadow-card">
          <span aria-hidden className="grid size-[34px] flex-none place-items-center rounded-[9px] bg-column-drop font-brand text-[15px] font-bold text-heading">
            C
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[11px] font-semibold tracking-[.03em] text-muted">{t.workspace}</span>
            <span className="text-[13.5px] font-semibold text-ink">{t.wsName}</span>
          </span>
          <ChevronDownIcon className="text-muted" />
        </div>
      </div>

      <nav aria-label={t.navLabel} className="flex flex-col gap-0.5 px-3.5 pb-1.5 pt-4">
        <NavButton active={isBoard} onClick={() => setView("board")}>
          <BoardIcon size={17} />
          {t.crumbBoard}
          <span
            data-testid="board-count"
            className="ms-auto inline-flex h-5 min-w-[22px] items-center justify-center rounded-full bg-segment px-1.5 text-[11.5px] font-semibold text-secondary"
          >
            {n(Object.keys(cards).length)}
          </span>
        </NavButton>
        <NavButton active={!isBoard} onClick={() => setView("chat")}>
          <ChatIcon size={17} />
          {t.chat}
          {unread > 0 && (
            <span
              data-testid="unread-badge"
              title={t.unread}
              className="ms-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-unread px-1.5 text-[11px] font-semibold text-white"
            >
              {n(unread)}
            </span>
          )}
        </NavButton>
      </nav>

      <div data-testid="sidebar-scroll" className="tidy-scroll flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3.5 pb-3 pt-1.5">
        <span className={cx(sectionTitle, "pt-3")}>{t.channels}</span>
        <button
          type="button"
          aria-current={generalActive || undefined}
          onClick={() => openRoom(GENERAL_SPACE)}
          className={spaceButton(generalActive)}
        >
          <span aria-hidden className="grid size-[22px] flex-none place-items-center rounded-md bg-column font-brand text-[13px] font-bold text-primary">
            #
          </span>
          <span className="flex-1 text-[13px] font-semibold text-ink">{t.general}</span>
        </button>
        <span className={cx(sectionTitle, "pt-3.5")}>{t.rooms}</span>
        {Object.values(cards).map((card) => (
          <RoomButton key={card.id} card={card} />
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-hairline px-3.5 pb-4 pt-3">
        <Segmented label={t.langLabel}>
          <SegmentButton active={language === "en"} onClick={() => setLanguage("en")} className="flex-1 font-brand">
            English
          </SegmentButton>
          <SegmentButton active={language === "fa"} onClick={() => setLanguage("fa")} className="flex-1 [font-family:var(--font-vazirmatn)]">
            فارسی
          </SegmentButton>
        </Segmented>
        <div data-testid="profile" className="flex items-center gap-2.5">
          <Avatar member={me} size={36} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[13px] font-semibold text-ink">{L(me.name)}</span>
            <span className="text-[11.5px] text-muted">{t.owner}</span>
          </span>
          <button
            type="button"
            aria-label={t.accountMenu}
            className="grid size-9 flex-none place-items-center rounded-lg text-muted transition-colors hover:bg-ghost-hover hover:text-ink"
          >
            <DotsIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
