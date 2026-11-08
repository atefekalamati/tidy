"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Card as CardType } from "@/lib/types";
import { dueState, focusCard, type DueState } from "@/lib/utils";
import { ArrowIcon, AvatarStack, ChatIcon, LabelChip, PriorityBadge, TrashIcon, cx } from "./ui";

const dueStyles: Record<DueState, string> = {
  overdue: "bg-due-overdue-bg text-due-overdue",
  today: "bg-due-today-bg text-due-today",
  tomorrow: "bg-due-tomorrow-bg text-due-tomorrow",
  later: "text-secondary",
  done: "bg-due-done-bg text-due-done",
};

/** Text for a due date's state, shared by the card badge and the task panel. */
export function useDueText() {
  const { t, date } = useT();
  return (iso: string, state: DueState) =>
    ({ overdue: date(iso), today: t.today, tomorrow: t.tomorrow, later: date(iso), done: t.doneBadge })[state];
}

function CardMeta({ card, done }: { card: CardType; done: boolean }) {
  const { t, n, pct } = useT();
  const members = useStore((s) => s.members);
  const messageCount = useStore((s) => s.messages[card.id]?.length ?? 0);
  const dueText = useDueText();
  const progress = done ? 100 : card.progress;
  const due = card.dueDate ? dueState(card.dueDate, done) : null;

  return (
    <>
      <div className="flex items-center gap-2">
        <span aria-hidden className="flex h-[5px] flex-1 overflow-hidden rounded-full bg-column">
          <span
            className={cx("rounded-full", progress >= 100 ? "bg-progress-done" : "bg-primary")}
            style={{ width: `${progress}%` }}
          />
        </span>
        <span data-testid="card-progress" className="min-w-[34px] text-end text-[11.5px] font-semibold text-secondary">
          {pct(progress)}
        </span>
      </div>
      <div className="flex min-h-6 items-center gap-2">
        <PriorityBadge priority={card.priority} />
        {due && card.dueDate && (
          <span
            data-testid="card-due"
            data-due={due}
            className={cx("inline-flex h-[22px] items-center rounded-md px-[7px] text-[12px]/4 font-medium", dueStyles[due])}
          >
            {dueText(card.dueDate, due)}
          </span>
        )}
        <span title={t.messageCount(n(messageCount))} className="inline-flex items-center gap-[3px] text-[12px]/4 font-medium text-muted">
          <ChatIcon size={13} />
          {n(messageCount)}
        </span>
        <span className="ms-auto">
          <AvatarStack members={card.memberIds.map((id) => members[id])} size={24} ring="ring-surface" />
        </span>
      </div>
    </>
  );
}

const cardShell = "rounded-[10px] border";
const quickButton = "grid size-9 place-items-center rounded-md transition-colors hover:bg-column hover:text-ink";

function density(compact: boolean) {
  return compact ? "gap-1.5 px-2.5 py-2" : "gap-2 p-3";
}

function Labels({ card }: { card: CardType }) {
  if (card.labelIds.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {card.labelIds.map((id) => (
        <LabelChip key={id} id={id} />
      ))}
    </div>
  );
}

/** The tilted copy that follows the pointer while dragging. */
export function CardOverlay({ card, done }: { card: CardType; done: boolean }) {
  const { L } = useT();
  const compact = useStore((s) => s.density === "compact");
  // dnd-kit measures the overlay's first child; the wrapper keeps the tilt out of that measurement,
  // otherwise cards in the same column count as "to the right" during keyboard dragging.
  return (
    <div>
      <div
        data-testid="drag-overlay"
        className={cx(cardShell, "flex rotate-2 cursor-grabbing flex-col border-surface-hover-border bg-surface-hover shadow-drag", density(compact))}
      >
        {!compact && <Labels card={card} />}
        <p dir="auto" className="line-clamp-2 text-[14px]/5 font-medium text-ink">
          {L(card.title)}
        </p>
        <CardMeta card={card} done={done} />
      </div>
    </div>
  );
}

export default function SortableCard({
  card,
  done,
  nextColumnName,
}: {
  card: CardType;
  done: boolean;
  nextColumnName?: string;
}) {
  const { t, L } = useT();
  const compact = useStore((s) => s.density === "compact");
  const openRoom = useStore((s) => s.openRoom);
  const moveCardBy = useStore((s) => s.moveCardBy);
  const deleteCard = useStore((s) => s.deleteCard);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-testid="card"
      data-card-id={card.id}
      className={cx(
        cardShell,
        "group relative flex flex-col",
        density(compact),
        isDragging
          ? "border-dashed border-dashed-line bg-transparent"
          : "border-surface-border bg-surface shadow-card transition-[background-color,border-color,box-shadow,translate] duration-150 hover:-translate-y-px hover:border-surface-hover-border hover:bg-surface-hover hover:shadow-card-hover",
      )}
    >
      {isDragging && <span data-testid="drop-line" className="absolute -inset-x-px -top-[6px] h-0.5 rounded-full bg-primary" />}
      <div className={cx("flex flex-col", compact ? "gap-1.5" : "gap-2", isDragging && "invisible")}>
        {!compact && <Labels card={card} />}
        <button
          ref={setActivatorNodeRef}
          type="button"
          data-card-open
          {...attributes}
          {...listeners}
          onClick={() => openRoom(card.id)}
          className="block text-start text-[14px]/5 font-medium text-ink outline-none! after:absolute after:inset-0 after:rounded-[10px] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
        >
          <span dir="auto" className="line-clamp-2">
            {L(card.title)}
          </span>
        </button>
        <CardMeta card={card} done={done} />
      </div>
      {!isDragging && (
        <div className="absolute end-2 top-2 z-[2] flex gap-0.5 rounded-lg border border-column-border bg-surface-hover p-0.5 text-secondary opacity-0 shadow-popover transition-opacity duration-100 group-focus-within:opacity-100 group-hover:opacity-100">
          <button type="button" aria-label={t.openRoomOf} title={t.openRoomOf} className={quickButton} onClick={() => openRoom(card.id)}>
            <ChatIcon size={14} />
          </button>
          {nextColumnName && (
            <button
              type="button"
              aria-label={t.moveTo(nextColumnName)}
              title={t.moveTo(nextColumnName)}
              className={quickButton}
              onClick={() => {
                moveCardBy(card.id, 1);
                focusCard(card.id);
              }}
            >
              <ArrowIcon size={14} />
            </button>
          )}
          <button
            type="button"
            aria-label={t.deleteCard}
            title={t.deleteCard}
            className={cx(quickButton, "text-priority-high hover:text-priority-high")}
            onClick={() => deleteCard(card.id)}
          >
            <TrashIcon size={14} />
          </button>
        </div>
      )}
    </article>
  );
}
