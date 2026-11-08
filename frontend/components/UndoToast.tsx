"use client";

import { useEffect } from "react";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { focusCard } from "@/lib/utils";

export const UNDO_MS = 6000;

export default function UndoToast() {
  const { t } = useT();
  const deleted = useStore((s) => s.lastDeleted);
  const undoDelete = useStore((s) => s.undoDelete);
  const dismissUndo = useStore((s) => s.dismissUndo);

  // Each deletion is a new object, so the 6 seconds restart with it.
  useEffect(() => {
    if (!deleted) return;
    const timer = setTimeout(dismissUndo, UNDO_MS);
    return () => clearTimeout(timer);
  }, [deleted, dismissUndo]);

  if (!deleted) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
      <div
        role="status"
        data-testid="undo-toast"
        className="pointer-events-auto flex items-center gap-2 rounded-xl bg-heading py-1 pe-1.5 ps-4 text-[13px] font-medium text-white shadow-dialog"
      >
        {t.cardDeleted}
        <span aria-hidden>{" · "}</span>
        <button
          type="button"
          onClick={() => {
            undoDelete();
            focusCard(deleted.card.id);
          }}
          className="h-9 rounded-lg px-2.5 font-semibold text-white underline underline-offset-2 transition-colors hover:bg-primary-hover"
        >
          {t.undo}
        </button>
      </div>
    </div>
  );
}
