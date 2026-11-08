"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import Board from "@/components/Board";
import CardDialog from "@/components/CardDialog";
import Chat from "@/components/Chat";
import Header from "@/components/Header";
import HelpDialog from "@/components/HelpDialog";
import { useStore } from "@/lib/store";
import { useShortcuts } from "@/lib/useShortcuts";

const subscribe = () => () => {};

export default function Home() {
  // Render only on the client so the persisted state never mismatches the server HTML.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const language = useStore((s) => s.language);
  const view = useStore((s) => s.view);
  const dialog = useStore((s) => s.dialog);
  useShortcuts();

  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
  }, [language]);

  if (!mounted) return null;

  return (
    <div className="flex h-dvh flex-col">
      <Header />
      {view === "board" ? <Board /> : <Chat />}
      {dialog?.type === "help" && <HelpDialog />}
      {dialog?.type === "card" && <CardDialog key={dialog.cardId ?? "new"} columnId={dialog.columnId} cardId={dialog.cardId} />}
    </div>
  );
}
