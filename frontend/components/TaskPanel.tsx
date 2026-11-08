"use client";

import { useT } from "@/lib/i18n";
import { columnOf, useStore } from "@/lib/store";
import { dueState } from "@/lib/utils";
import { useDueText } from "./Card";
import { Avatar, CloseIcon, LabelChip, cx, priorityColor } from "./ui";

const dueColors = {
  overdue: "var(--color-due-overdue)",
  today: "var(--color-due-today)",
  tomorrow: "var(--color-due-tomorrow)",
  later: "var(--color-heading)",
  done: "var(--color-due-done)",
};

const fieldTitle = "text-[12px] font-semibold text-muted";

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between gap-2.5 border-b border-rule py-2.5">
      <span className="text-[12.5px] text-muted">{label}</span>
      <span dir="auto" style={{ color }} className="text-[12.5px] font-semibold">
        {value}
      </span>
    </div>
  );
}

export default function TaskPanel({ cardId }: { cardId: string }) {
  const { t, n, pct, L, columnName } = useT();
  const card = useStore((s) => s.cards[cardId]);
  const column = useStore((s) => columnOf(s.columns, cardId));
  const members = useStore((s) => s.members);
  const setProgress = useStore((s) => s.setProgress);
  const postProgress = useStore((s) => s.postProgress);
  const addMember = useStore((s) => s.addMember);
  const removeMember = useStore((s) => s.removeMember);
  const openDialog = useStore((s) => s.openDialog);
  const dueText = useDueText();

  const done = column.id === "done";
  const progress = done ? 100 : card.progress;
  const others = Object.values(members).filter((m) => !card.memberIds.includes(m.id));
  const due = card.dueDate ? dueState(card.dueDate, done) : null;
  const details = L(card.details);

  return (
    <aside
      aria-label={t.taskInfo}
      className="tidy-scroll flex h-full w-80 flex-none flex-col gap-5 overflow-y-auto border-s border-hairline bg-surface p-5"
    >
      <div className="flex flex-col gap-2.5 rounded-xl bg-column p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[12.5px] font-semibold text-heading">{t.progress}</span>
          <span data-testid="panel-progress" className="text-[26px]/[30px] font-bold text-heading">
            {pct(progress)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          disabled={done}
          aria-label={t.progress}
          aria-valuetext={pct(progress)}
          onChange={(e) => setProgress(cardId, Number(e.target.value))}
          className="h-9 w-full accent-primary"
        />
        <button
          type="button"
          onClick={() => postProgress(cardId)}
          className="h-9 rounded-lg bg-primary text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {t.postUpdate}
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className={fieldTitle}>
          {t.members} · {n(card.memberIds.length)}
        </span>
        {card.memberIds.map((id) => (
          <div key={id} data-testid="panel-member" className="flex items-center gap-2.5">
            <Avatar member={members[id]} size={30} />
            <span className="flex-1 text-[13px] font-medium text-ink">{L(members[id].name)}</span>
            <button
              type="button"
              aria-label={t.removeMember(L(members[id].name))}
              onClick={() => removeMember(cardId, id)}
              className="grid size-9 place-items-center rounded-[7px] text-muted transition-colors hover:bg-ghost-hover hover:text-ink"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
        {others.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {others.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => addMember(cardId, m.id)}
                className="h-9 rounded-full border border-dashed border-dashed-line px-2.5 text-[12px] font-medium text-primary transition-colors hover:bg-ghost-hover"
              >
                + {L(m.name)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col border-t border-rule">
        <Row label={t.column} value={columnName(column)} color="var(--color-heading)" />
        <Row label={t.priority} value={t.priorities[card.priority]} color={priorityColor[card.priority]} />
        <Row
          label={t.due}
          value={due && card.dueDate ? dueText(card.dueDate, due) : t.noDue}
          color={due ? dueColors[due] : "var(--color-muted)"}
        />
      </div>

      {card.labelIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.labelIds.map((id) => (
            <LabelChip key={id} id={id} tall />
          ))}
        </div>
      )}

      {details && (
        <div className="flex flex-col gap-1.5">
          <span className={fieldTitle}>{t.details}</span>
          <p dir="auto" className="text-[13px]/[21px] text-ink">
            {details}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => openDialog({ type: "card", columnId: column.id, cardId })}
        className={cx("h-9 flex-none rounded-lg border border-surface-border text-[12.5px] font-semibold text-primary transition-colors hover:bg-ghost-hover")}
      >
        {t.editTask}
      </button>
    </aside>
  );
}
