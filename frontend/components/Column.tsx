"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Column as ColumnType } from "@/lib/types";
import SortableCard from "./Card";
import { ChevronIcon, DotsIcon, PlusIcon, cx, iconButton } from "./ui";

const accentBorder = (id: string) => ({ borderTop: `3px solid var(--accent-${id})` });
const columnGhost = "hover:bg-column-border hover:text-ink";
const menuItem = "flex h-9 items-center gap-2.5 rounded-[7px] px-2.5 text-start text-[13px] text-ink hover:bg-column";

function RenameInput({ column, name, onDone }: { column: ColumnType; name: string; onDone: () => void }) {
  const { t } = useT();
  const renameColumn = useStore((s) => s.renameColumn);
  return (
    <input
      autoFocus
      dir="auto"
      defaultValue={name}
      aria-label={t.rename}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={(e) => {
        if (e.currentTarget.value.trim() !== name) renameColumn(column.id, e.currentTarget.value);
        onDone();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") e.currentTarget.value = name;
        if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
      }}
      className="h-7 min-w-0 flex-1 rounded-md border border-surface-hover-border bg-surface px-1.5 text-[13px]/5 font-semibold text-heading"
    />
  );
}

function ColumnMenu({ column, onClose, onRename }: { column: ColumnType; onClose: () => void; onRename: () => void }) {
  const { t, n } = useT();
  const setWipLimit = useStore((s) => s.setWipLimit);
  const toggleColumn = useStore((s) => s.toggleColumn);
  const [editingWip, setEditingWip] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector("button")?.focus();
    const closeOnOutside = (e: PointerEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose();
    };
    const closeOnEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  function moveFocus(e: KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...ref.current!.querySelectorAll<HTMLElement>("[role=menuitem]")];
    const next = items.indexOf(document.activeElement as HTMLElement) + (e.key === "ArrowDown" ? 1 : -1);
    items.at(next % items.length)?.focus();
  }

  function saveWip(value: string) {
    const limit = Number(value);
    setWipLimit(column.id, limit > 0 ? Math.floor(limit) : null);
    onClose();
  }

  return (
    <div
      ref={ref}
      role="menu"
      onKeyDown={moveFocus}
      className="absolute end-2 top-12 z-10 flex w-[200px] flex-col gap-0.5 rounded-[10px] border border-column-border bg-surface p-1.5 shadow-popover"
    >
      <button type="button" role="menuitem" className={menuItem} onClick={onRename}>
        {t.rename}
      </button>
      {editingWip ? (
        <input
          autoFocus
          type="number"
          min={0}
          defaultValue={column.wipLimit ?? ""}
          aria-label={t.wipInput}
          title={t.wipInput}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => saveWip(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="h-9 rounded-[7px] border border-surface-hover-border bg-surface-hover px-2.5 text-[13px] text-ink"
        />
      ) : (
        <button type="button" role="menuitem" className={menuItem} onClick={() => setEditingWip(true)}>
          {t.wip}
          <span className="ms-auto text-[12px] text-muted">{column.wipLimit ? n(column.wipLimit) : t.none}</span>
        </button>
      )}
      <button
        type="button"
        role="menuitem"
        className={menuItem}
        onClick={() => {
          toggleColumn(column.id);
          onClose();
        }}
      >
        {t.collapse}
      </button>
    </div>
  );
}

function CollapsedColumn({ column, isDropTarget }: { column: ColumnType; isDropTarget: boolean }) {
  const { t, n, columnName } = useT();
  const toggleColumn = useStore((s) => s.toggleColumn);
  const { setNodeRef } = useDroppable({ id: column.id });
  const name = columnName(column);

  return (
    <section
      ref={setNodeRef}
      aria-label={name}
      data-testid={`column-${column.id}`}
      data-collapsed="true"
      data-column-id={column.id}
      style={accentBorder(column.id)}
      className={cx(
        "flex min-h-[420px] w-12 flex-none flex-col items-center gap-3 rounded-xl border border-column-border py-2.5 transition-colors",
        isDropTarget ? "bg-column-drop" : "bg-column",
      )}
    >
      <button type="button" aria-label={t.expand(name)} onClick={() => toggleColumn(column.id)} className={cx(iconButton, columnGhost)}>
        <ChevronIcon />
      </button>
      <span className="rounded-full bg-surface px-[7px] py-0.5 text-[12px]/4 font-semibold text-secondary">
        {n(column.cardIds.length)}
      </span>
      <span dir="auto" className="text-[13px] font-semibold text-heading [writing-mode:vertical-rl]">
        {name}
      </span>
    </section>
  );
}

export default function Column({
  column,
  nextColumnName,
  isDropTarget,
}: {
  column: ColumnType;
  nextColumnName?: string;
  isDropTarget: boolean;
}) {
  const { t, n, language, columnName } = useT();
  const cards = useStore((s) => s.cards);
  const openDialog = useStore((s) => s.openDialog);
  const { setNodeRef } = useDroppable({ id: column.id, disabled: column.collapsed });
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  if (column.collapsed) return <CollapsedColumn column={column} isDropTarget={isDropTarget} />;

  const name = columnName(column);
  const count = column.cardIds.length;
  const limit = column.wipLimit;
  const wip = limit === null || count < limit ? "ok" : count === limit ? "at" : "over";
  const closeMenu = () => {
    setMenuOpen(false);
    menuButton.current?.focus();
  };
  const addCard = () => openDialog({ type: "card", columnId: column.id });

  return (
    <section
      aria-label={name}
      data-testid={`column-${column.id}`}
      data-column-id={column.id}
      data-wip={wip}
      data-drop-target={isDropTarget || undefined}
      style={accentBorder(column.id)}
      className={cx(
        "relative flex w-72 flex-none flex-col rounded-xl border transition-colors",
        wip === "over" ? "border-column-over-border" : "border-column-border",
        isDropTarget ? "bg-column-drop" : "bg-column",
      )}
    >
      <div className="flex items-center gap-2 pb-2 pe-2 ps-3.5 pt-2.5">
        {renaming ? (
          <RenameInput key={language} column={column} name={name} onDone={() => setRenaming(false)} />
        ) : (
          <h2 dir="auto" className="truncate text-[13px]/5 font-semibold text-heading">
            {name}
          </h2>
        )}
        <span
          data-testid="wip-count"
          title={wip === "over" ? t.overLimit : wip === "at" ? t.atLimit : t.cardCount(n(count))}
          className={cx(
            "inline-flex h-5 flex-none items-center rounded-full px-[7px] text-[12px]/4 font-medium",
            wip === "over" && "bg-due-overdue-bg text-due-overdue",
            wip === "at" && "bg-due-today-bg text-due-today",
            wip === "ok" && "bg-surface text-secondary",
          )}
        >
          {limit ? `${n(count)} / ${n(limit)}` : n(count)}
        </span>
        <span className="ms-auto flex gap-0.5">
          <button type="button" aria-label={t.addTo(name)} onClick={addCard} className={cx(iconButton, columnGhost)}>
            <PlusIcon size={15} />
          </button>
          <button
            ref={menuButton}
            type="button"
            aria-label={t.columnMenu(name)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className={cx(iconButton, columnGhost)}
          >
            <DotsIcon />
          </button>
        </span>
      </div>

      {menuOpen && (
        <ColumnMenu
          column={column}
          onClose={closeMenu}
          onRename={() => {
            setMenuOpen(false);
            setRenaming(true);
          }}
        />
      )}

      <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
        {/* Margin, not padding: the droppable's edges must line up with its cards so
            keyboard dragging can find the neighbouring column. */}
        <div ref={setNodeRef} className="mx-2 flex min-h-14 flex-col gap-2">
          {column.cardIds.map((id) => (
            <SortableCard key={id} card={cards[id]} done={column.id === "done"} nextColumnName={nextColumnName} />
          ))}
        </div>
      </SortableContext>

      <button
        type="button"
        onClick={addCard}
        className="m-2 flex h-9 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-secondary transition-colors hover:bg-column-border hover:text-heading"
      >
        <PlusIcon size={15} />
        {t.add}
      </button>
    </section>
  );
}
