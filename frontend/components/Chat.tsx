"use client";

import { useT } from "@/lib/i18n";
import { columnOf, useStore } from "@/lib/store";
import type { Card } from "@/lib/types";
import { GENERAL_SPACE } from "@/src/data/seed";
import Conversation from "./Conversation";
import TaskPanel from "./TaskPanel";
import { cx } from "./ui";

const spaceButton = (active: boolean) =>
  cx(
    "flex w-full items-start gap-2.5 rounded-[10px] px-2.5 py-[9px] text-start transition-colors",
    active ? "bg-column shadow-[inset_0_0_0_1px_var(--color-selected-ring)]" : "hover:bg-space-hover",
  );
const sectionTitle = "px-2.5 text-[11.5px] font-semibold tracking-[.02em] text-muted";

function RoomButton({ card }: { card: Card }) {
  const { t, n, pct, L } = useT();
  const active = useStore((s) => s.activeSpace === card.id);
  const columnId = useStore((s) => columnOf(s.columns, card.id).id);
  const openSpace = useStore((s) => s.openSpace);
  const progress = columnId === "done" ? 100 : card.progress;

  return (
    <button
      type="button"
      data-testid="room"
      aria-current={active || undefined}
      onClick={() => openSpace(card.id)}
      className={spaceButton(active)}
    >
      <span aria-hidden className="mt-1.5 size-2 flex-none rounded-full" style={{ backgroundColor: `var(--accent-${columnId})` }} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span dir="auto" className="truncate text-[13px] font-semibold text-ink">
          {L(card.title)}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="flex h-1 w-12 overflow-hidden rounded-full bg-column">
            <span className="bg-primary" style={{ width: `${progress}%` }} />
          </span>
          <span className="text-[11.5px] text-muted">
            {pct(progress)} · {t.memberCount(n(card.memberIds.length))}
          </span>
        </span>
      </span>
    </button>
  );
}

function Spaces() {
  const { t, n } = useT();
  const cards = useStore((s) => s.cards);
  const memberCount = useStore((s) => Object.keys(s.members).length);
  const general = useStore((s) => s.activeSpace === GENERAL_SPACE);
  const openSpace = useStore((s) => s.openSpace);

  return (
    <aside
      aria-label={t.spacesLabel}
      className="tidy-scroll flex h-full w-[272px] flex-none flex-col gap-1.5 overflow-y-auto border-e border-hairline bg-chrome px-3 py-[18px]"
    >
      <span className={cx(sectionTitle, "pb-1.5")}>{t.teamSpace}</span>
      <button type="button" aria-current={general || undefined} onClick={() => openSpace(GENERAL_SPACE)} className={spaceButton(general)}>
        <span aria-hidden className="grid size-8 place-items-center rounded-[9px] bg-primary font-brand text-[16px] font-bold text-white">
          #
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13.5px] font-semibold text-ink">{t.general}</span>
          <span className="text-[12px] text-muted">{t.generalSub(n(memberCount))}</span>
        </span>
      </button>
      <span className={cx(sectionTitle, "pb-1.5 pt-3.5")}>{t.rooms}</span>
      {Object.values(cards).map((card) => (
        <RoomButton key={card.id} card={card} />
      ))}
    </aside>
  );
}

export default function Chat() {
  const space = useStore((s) => s.activeSpace);
  const hasTask = useStore((s) => space !== GENERAL_SPACE && !!s.cards[space]);

  return (
    <main className="tidy-scroll flex min-h-0 flex-1 overflow-x-auto">
      <Spaces />
      <Conversation key={space} spaceId={space} />
      {hasTask && <TaskPanel key={`panel-${space}`} cardId={space} />}
    </main>
  );
}
