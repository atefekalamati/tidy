"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { ColumnId, Priority } from "@/lib/types";
import { CURRENT_USER_ID, labels } from "@/src/data/seed";
import Dialog from "./Dialog";
import JalaliDatePicker from "./JalaliDatePicker";
import { Segmented, SegmentButton, cx } from "./ui";

const inputClass = "w-full rounded-lg border border-surface-border bg-surface-hover px-2.5 text-[14px] text-ink placeholder:text-muted";
const fieldTitle = "text-[12px]/4 font-semibold text-muted";
const priorities: Priority[] = ["high", "medium", "low"];

function Field({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={fieldTitle}>{title}</span>
      {children}
    </div>
  );
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "h-9 rounded-full border px-3 text-[12px] font-medium transition-colors",
        active ? "border-primary bg-primary text-white" : "border-surface-border text-secondary hover:bg-ghost-hover",
      )}
    >
      {children}
    </button>
  );
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

export default function CardDialog({ columnId, cardId }: { columnId: ColumnId; cardId?: string }) {
  const { t, L } = useT();
  const card = useStore((s) => (cardId ? s.cards[cardId] : undefined));
  const members = useStore((s) => s.members);
  const addCard = useStore((s) => s.addCard);
  const updateCard = useStore((s) => s.updateCard);
  const closeDialog = useStore((s) => s.closeDialog);

  const [title, setTitle] = useState(card ? L(card.title) : "");
  const [details, setDetails] = useState(card ? L(card.details) : "");
  const [priority, setPriority] = useState<Priority>(card?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(card?.dueDate ?? null);
  const [labelIds, setLabelIds] = useState(card?.labelIds ?? []);
  const [memberIds, setMemberIds] = useState(card?.memberIds ?? [CURRENT_USER_ID]);
  const [error, setError] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError(true);
    const input = {
      // Untouched sample text stays localized; an edit makes it the user's own text.
      title: card && title === L(card.title) ? card.title : title.trim(),
      details: card && details === L(card.details) ? card.details : details.trim(),
      priority,
      dueDate,
      labelIds,
      memberIds,
    };
    if (cardId) updateCard(cardId, input);
    else addCard(columnId, input);
    closeDialog();
  }

  return (
    <Dialog title={card ? t.dialog.editCard : t.dialog.newCard} className="my-auto w-[calc(100%-40px)] max-w-[480px]">
      <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
        <label className="flex cursor-auto flex-col gap-1.5">
          <span className={fieldTitle}>{t.dialog.title}</span>
          <input
            data-autofocus
            dir="auto"
            value={title}
            placeholder={t.dialog.titlePlaceholder}
            aria-invalid={error}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(false);
            }}
            className={cx(inputClass, "h-10")}
          />
          {error && (
            <span role="alert" className="text-[12px] font-medium text-due-overdue">
              {t.dialog.titleRequired}
            </span>
          )}
        </label>
        <label className="flex cursor-auto flex-col gap-1.5">
          <span className={fieldTitle}>{t.dialog.details}</span>
          <textarea
            dir="auto"
            rows={3}
            value={details}
            placeholder={t.dialog.detailsPlaceholder}
            onChange={(e) => setDetails(e.target.value)}
            className={cx(inputClass, "resize-none py-2 text-[13px]/5")}
          />
        </label>
        <Field title={t.priority}>
          <div className="w-fit">
            <Segmented label={t.priority}>
              {priorities.map((p) => (
                <SegmentButton key={p} active={priority === p} onClick={() => setPriority(p)}>
                  {t.priorities[p]}
                </SegmentButton>
              ))}
            </Segmented>
          </div>
        </Field>
        <Field title={t.due}>
          <JalaliDatePicker value={dueDate} onChange={setDueDate} />
        </Field>
        <Field title={t.labels}>
          <div className="flex flex-wrap gap-1.5">
            {labels.map((label) => (
              <ToggleChip key={label.id} active={labelIds.includes(label.id)} onClick={() => setLabelIds((l) => toggle(l, label.id))}>
                {L(label.name)}
              </ToggleChip>
            ))}
          </div>
        </Field>
        <Field title={t.members}>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(members).map((m) => (
              <ToggleChip key={m.id} active={memberIds.includes(m.id)} onClick={() => setMemberIds((l) => toggle(l, m.id))}>
                {L(m.name)}
              </ToggleChip>
            ))}
          </div>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={closeDialog}
            className="h-9 rounded-lg border border-surface-border px-4 text-[13px] font-medium text-secondary transition-colors hover:bg-ghost-hover"
          >
            {t.dialog.cancel}
          </button>
          <button type="submit" className="h-9 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover">
            {t.dialog.save}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
