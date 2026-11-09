"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import Board from "@/components/Board";
import CardDialog from "@/components/CardDialog";
import Chat from "@/components/Chat";
import Header from "@/components/Header";
import HelpDialog from "@/components/HelpDialog";
import Sidebar from "@/components/Sidebar";
import UndoToast from "@/components/UndoToast";
import {
  getStorageError,
  getStorageStatus,
  restoreV1Backup,
  subscribeStorageStatus,
  useStore,
} from "@/lib/store";
import { useShortcuts } from "@/lib/useShortcuts";

const subscribe = () => () => {};

function StorageRecovery() {
  const [actionError, setActionError] = useState("");
  const storageError = getStorageError();

  async function restore() {
    setActionError("");
    try {
      await restoreV1Backup();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <main className="flex h-dvh items-center justify-center bg-page p-6">
      <section
        role="alert"
        className="flex w-full max-w-xl flex-col gap-4 rounded-xl border border-surface-border bg-surface p-6 shadow-card"
      >
        <h1 className="text-lg font-semibold text-heading">Saved data could not be loaded safely</h1>
        <p className="text-sm leading-6 text-secondary">
          Your original browser data has not been cleared. If a backup was created, it remains in local storage. Free
          storage space or restore the backup, then retry.
          <span className="mt-2 block" lang="fa" dir="rtl">
            داده‌ی اصلی پاک نشده است. اگر نسخه‌ی پشتیبان ساخته شده باشد، در حافظه‌ی مرورگر باقی است. فضای ذخیره‌سازی را
            خالی کنید یا پشتیبان را بازیابی کنید و دوباره تلاش کنید.
          </span>
        </p>
        {storageError instanceof Error && (
          <p className="break-words text-xs text-muted">{storageError.message}</p>
        )}
        {actionError && <p className="break-words text-xs text-due-overdue">{actionError}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void useStore.persist.rehydrate()}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Retry · تلاش دوباره
          </button>
          <button
            type="button"
            onClick={() => void restore()}
            className="h-10 rounded-lg border border-surface-border px-4 text-sm font-semibold text-heading hover:bg-ghost-hover"
          >
            Restore backup · بازیابی پشتیبان
          </button>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  // Render only on the client so the persisted state never mismatches the server HTML.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const storageStatus = useSyncExternalStore(subscribeStorageStatus, getStorageStatus, () => "loading");
  const language = useStore((s) => s.language);
  const view = useStore((s) => s.view);
  const dialog = useStore((s) => s.dialog);
  useShortcuts(storageStatus === "ready");

  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
  }, [language]);

  if (!mounted || storageStatus === "loading") return null;
  if (storageStatus === "error") return <StorageRecovery />;

  return (
    <div className="flex h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        {view === "board" ? <Board /> : <Chat />}
      </div>
      <UndoToast />
      {dialog?.type === "help" && <HelpDialog />}
      {dialog?.type === "card" && <CardDialog key={dialog.cardId ?? "new"} columnId={dialog.columnId} cardId={dialog.cardId} />}
    </div>
  );
}
