"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { CloseIcon, cx } from "./ui";

/** Native modal dialog: focus trapping, Esc, inert background and focus return come from the browser. */
export default function Dialog({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  const { t } = useT();
  const closeDialog = useStore((s) => s.closeDialog);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
    // showModal focuses the first control, so the field that should start focused is focused after it.
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={closeDialog}
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
      className={cx("mx-auto rounded-2xl border border-segment-border bg-surface p-0 text-ink shadow-dialog", className)}
    >
      <div className="flex flex-col gap-3.5 px-[22px] py-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px]/[26px] font-semibold text-heading">{title}</h2>
          <button
            type="button"
            aria-label={t.close}
            onClick={() => ref.current?.close()}
            className="grid size-9 place-items-center rounded-lg text-secondary transition-colors hover:bg-ghost-hover hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
