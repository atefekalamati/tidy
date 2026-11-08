"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { placeCard, useStore } from "@/lib/store";
import type { Column as ColumnType } from "@/lib/types";
import { CardOverlay } from "./Card";
import Column from "./Column";

const findColumn = (columns: ColumnType[], id: UniqueIdentifier) =>
  columns.find((c) => c.id === id || c.cardIds.includes(String(id)));

export default function Board() {
  const { t, L, columnName } = useT();
  const storedColumns = useStore((s) => s.columns);
  const cards = useStore((s) => s.cards);
  const moveCard = useStore((s) => s.moveCard);
  // While dragging, the board renders this preview; the store only sees the final drop.
  const [preview, setPreview] = useState<ColumnType[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const columns = preview ?? storedColumns;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space", "Enter"] },
    }),
  );

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    setPreview((current) => {
      if (!current) return current;
      const from = findColumn(current, active.id);
      const to = findColumn(current, over.id);
      if (!from || !to || from === to) return current;
      const overIndex = to.cardIds.indexOf(String(over.id));
      return placeCard(current, String(active.id), to.id, overIndex === -1 ? to.cardIds.length : overIndex);
    });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const column = preview && findColumn(preview, active.id);
    setActiveId(null);
    setPreview(null);
    if (!column || !over) return;
    const overIndex = column.cardIds.indexOf(String(over.id));
    moveCard(String(active.id), column.id, overIndex !== -1 ? overIndex : column.cardIds.indexOf(String(active.id)));
  }

  const targetName = (id: UniqueIdentifier) => {
    const column = findColumn(columns, id);
    return column ? columnName(column) : "";
  };
  const cardTitle = (id: UniqueIdentifier) => (cards[id] ? L(cards[id].title) : "");
  const announcements: Announcements = {
    onDragStart: ({ active }) => t.dnd.picked(cardTitle(active.id)),
    onDragOver: ({ active, over }) => (over ? t.dnd.over(cardTitle(active.id), targetName(over.id)) : undefined),
    onDragEnd: ({ active, over }) => (over ? t.dnd.dropped(cardTitle(active.id), targetName(over.id)) : undefined),
    onDragCancel: ({ active }) => t.dnd.cancelled(cardTitle(active.id)),
  };

  const activeCard = activeId ? cards[activeId] : undefined;

  return (
    <main className="tidy-scroll flex-1 overflow-auto px-8 pb-8 pt-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        accessibility={{ announcements, screenReaderInstructions: { draggable: t.dnd.instructions } }}
        onDragStart={({ active }) => {
          setActiveId(String(active.id));
          setPreview(useStore.getState().columns);
        }}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveId(null);
          setPreview(null);
        }}
      >
        <div className="flex min-w-max items-start gap-3.5">
          {columns.map((column, index) => {
            const next = columns[index + 1];
            return (
              <Column
                key={column.id}
                column={column}
                nextColumnName={next && columnName(next)}
                isDropTarget={activeId !== null && column.cardIds.includes(activeId)}
              />
            );
          })}
        </div>
        <DragOverlay>
          {activeCard && <CardOverlay card={activeCard} done={findColumn(columns, activeCard.id)?.id === "done"} />}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
