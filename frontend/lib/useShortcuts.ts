"use client";

import { useEffect } from "react";
import { columnOf, useStore } from "./store";
import type { ColumnId } from "./types";
import { focusCard } from "./utils";

const CHORD_MS = 1500;

/**
 * Global keyboard shortcuts. Letters and punctuation match the physical key (event.code),
 * so they keep working when a Persian keyboard layout is active.
 * Enter is the focused card's own button and Esc is handled by dialogs and menus.
 */
export function useShortcuts(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    let lastG = 0;

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      const target = e.target as HTMLElement;
      if (target.closest("input:not([type=range]), textarea, select, [contenteditable]")) return;
      if (document.querySelector("dialog[open]") || target.closest('[aria-pressed="true"][data-card-open]')) return;

      const store = useStore.getState();
      const onBoard = store.view === "board";
      const cardId = target.closest<HTMLElement>("[data-card-id]")?.dataset.cardId;

      if (e.key === "?" || e.key === "؟") {
        store.openDialog({ type: "help" });
        return;
      }
      if (e.shiftKey) return;

      const chord = Date.now() - lastG < CHORD_MS;
      lastG = 0;
      if (chord && e.code === "KeyC") return store.setView("chat");
      if (chord && e.code === "KeyB") return store.setView("board");

      switch (e.code) {
        case "KeyG":
          lastG = Date.now();
          break;
        case "KeyL":
          store.setLanguage(store.language === "en" ? "fa" : "en");
          break;
        case "KeyN":
          if (onBoard) {
            e.preventDefault(); // Keeps the "n" out of the title field that is about to open.
            const columnId = target.closest<HTMLElement>("[data-column-id]")?.dataset.columnId as ColumnId | undefined;
            store.openDialog({ type: "card", columnId: columnId ?? "todo" });
          }
          break;
        case "Comma":
        case "Period":
          if (cardId) {
            store.moveCardBy(cardId, e.code === "Comma" ? -1 : 1);
            focusCard(cardId);
          }
          break;
        case "Delete":
          if (cardId) {
            const ids = columnOf(store.columns, cardId).cardIds;
            const index = ids.indexOf(cardId);
            store.deleteCard(cardId);
            focusCard(ids[index + 1] ?? ids[index - 1]);
          }
          break;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
