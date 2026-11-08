"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useT } from "@/lib/i18n";
import { columnOf, useStore } from "@/lib/store";
import type { ChatMessage, EventMessage, Message, SpaceId, TaskMessage } from "@/lib/types";
import { compressImage, dataUrlBytes } from "@/lib/compressImage";
import { CURRENT_USER_ID, GENERAL_SPACE, MAX_IMAGE_BYTES } from "@/data/seed";
import { ArrowIcon, Avatar, AvatarStack, ChatIcon, EventIcon, ImageIcon, TaskIcon, cx } from "./ui";

const eventIcons = {
  progress: "M3 17l6-6 4 4 8-8M15 7h6v6",
  added: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6",
  removed: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 11h-6",
  moved: "M5 12h14M13 6l6 6-6 6",
};

function useAuthorName() {
  const { t, L } = useT();
  const members = useStore((s) => s.members);
  return (id: string) => (id === CURRENT_USER_ID ? t.you : L(members[id].name));
}

function EventRow({ message }: { message: EventMessage }) {
  const { t, n, pct, L, columnName } = useT();
  const members = useStore((s) => s.members);
  const columns = useStore((s) => s.columns);
  const who = useAuthorName()(message.authorId);

  let text: string;
  if (message.event === "progress") text = t.events.progress(who, pct(message.value));
  else if (message.event === "moved") text = t.events.moved(who, columnName(columns.find((c) => c.id === message.columnId)!));
  else text = t.events[message.event](who, L(members[message.memberId].name));

  return (
    <div data-testid="event" className="inline-flex items-center gap-1.5 self-center rounded-full bg-ghost-hover px-3 py-[5px] text-[12px] text-secondary">
      <span className={cx(message.event === "moved" && "rtl:-scale-x-100")}>
        <EventIcon path={eventIcons[message.event]} />
      </span>
      {text}
      <span>· {n(message.time)}</span>
    </div>
  );
}

function TaskCreatedRow({ message }: { message: TaskMessage }) {
  const { t, n, L } = useT();
  const card = useStore((s) => s.cards[message.cardId]);
  const openSpace = useStore((s) => s.openSpace);
  const who = useAuthorName()(message.authorId);

  return (
    <div data-testid="task-created" className="flex w-[min(420px,100%)] flex-col gap-2 self-center rounded-xl border border-selected-ring bg-surface px-3.5 py-3">
      <span className="text-[12px] text-muted">
        {t.events.created(who)} · {n(message.time)}
      </span>
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="grid size-[30px] flex-none place-items-center rounded-lg bg-column text-primary">
          <TaskIcon size={16} />
        </span>
        <span dir="auto" className="flex-1 text-[14px] font-semibold text-ink">
          {L(card.title)}
        </span>
        <button
          type="button"
          onClick={() => openSpace(message.cardId)}
          className="h-9 flex-none rounded-[7px] border border-surface-border px-2.5 text-[12px] font-medium text-primary transition-colors hover:bg-ghost-hover"
        >
          {t.openRoom}
        </button>
      </div>
    </div>
  );
}

function Bubble({ message, onImageLoad }: { message: ChatMessage; onImageLoad: () => void }) {
  const { n, L } = useT();
  const members = useStore((s) => s.members);
  const own = message.authorId === CURRENT_USER_ID;
  const name = useAuthorName()(message.authorId);
  const text = message.text ? L(message.text) : "";
  const image = message.image;

  return (
    <div data-testid="message" className={cx("flex items-end gap-2", own ? "justify-end" : "justify-start")}>
      {!own && <Avatar member={members[message.authorId]} size={30} />}
      <div className={cx("flex max-w-[68%] flex-col gap-1", own ? "items-end" : "items-start")}>
        <span className="px-1 text-[11.5px] text-muted">
          <b className="font-semibold text-heading">{name}</b> · {n(message.time)}
        </span>
        <div
          className={cx(
            "flex flex-col gap-2 rounded-[14px] px-3 py-2.5",
            own ? "rounded-ee-[4px] bg-primary text-white" : "rounded-es-[4px] border border-surface-border bg-surface text-ink",
          )}
        >
          {image?.src && (
            // eslint-disable-next-line @next/next/no-img-element -- local data URLs need no optimization
            <img src={image.src} alt={image.file} onLoad={onImageLoad} className="block max-h-[220px] max-w-[280px] rounded-lg object-cover" />
          )}
          {image && !image.src && (
            <div
              role="img"
              aria-label={image.file}
              className="flex h-[150px] w-[260px] flex-col items-center justify-center gap-1.5 rounded-lg border border-selected-ring bg-column-drop text-primary"
            >
              <ImageIcon size={30} />
              <span className="font-mono text-[11px] text-heading">{image.file}</span>
            </div>
          )}
          {text && (
            <span dir="auto" className="block whitespace-pre-wrap text-[13.5px]/[21px] [overflow-wrap:anywhere]">
              {text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageRow({ message, onImageLoad }: { message: Message; onImageLoad: () => void }) {
  if (message.type === "event") return <EventRow message={message} />;
  if (message.type === "task") return <TaskCreatedRow message={message} />;
  return <Bubble message={message} onImageLoad={onImageLoad} />;
}

function Composer({ spaceId }: { spaceId: SpaceId }) {
  const { t } = useT();
  const sendMessage = useStore((s) => s.sendMessage);
  const createTaskFromMessage = useStore((s) => s.createTaskFromMessage);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const text = draft.trim();

  function reset() {
    setDraft("");
    setError("");
  }

  function send() {
    if (!text) return;
    sendMessage(spaceId, { text });
    reset();
  }

  function createTask() {
    if (!text) return;
    createTaskFromMessage(spaceId, text);
    reset();
  }

  async function attach(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError(t.notAnImage);
    let src: string;
    try {
      src = await compressImage(file);
    } catch {
      return setError(t.notAnImage);
    }
    if (dataUrlBytes(src) > MAX_IMAGE_BYTES) return setError(t.imageTooLarge);
    if (sendMessage(spaceId, { text: text || undefined, image: { src, file: file.name } })) reset();
    else setError(t.storageFull);
  }

  return (
    <div className="bg-page px-6 pb-[18px] pt-3">
      <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface p-1.5 shadow-card">
        <label
          title={t.attach}
          className="relative grid size-[38px] flex-none place-items-center rounded-[9px] bg-segment text-secondary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"
        >
          <input type="file" accept="image/*" aria-label={t.attach} onChange={attach} className="absolute size-px overflow-hidden opacity-0" />
          <ImageIcon size={18} />
        </label>
        <input
          dir="auto"
          value={draft}
          aria-label={t.placeholder}
          placeholder={t.placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="h-[38px] min-w-0 flex-1 bg-transparent px-1.5 text-[14px] text-ink placeholder:text-muted"
        />
        <button
          type="button"
          disabled={!text}
          title={t.makeTaskHint}
          onClick={createTask}
          className="flex h-[38px] flex-none items-center gap-1.5 rounded-[9px] border border-surface-border px-3 text-[12.5px] font-semibold text-primary transition-colors hover:bg-ghost-hover disabled:opacity-55 disabled:hover:bg-transparent"
        >
          <TaskIcon size={15} />
          {t.makeTask}
        </button>
        <button
          type="button"
          disabled={!text}
          onClick={send}
          className="flex h-[38px] flex-none items-center gap-1.5 rounded-[9px] bg-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-55 disabled:hover:bg-primary"
        >
          {t.send}
          <ArrowIcon size={15} />
        </button>
      </div>
      {error ? (
        <p role="alert" className="mx-1 mt-1.5 text-[11.5px] font-medium text-due-overdue">
          {error}
        </p>
      ) : (
        <p className="mx-1 mt-1.5 text-[11.5px] text-muted">{t.composerHint}</p>
      )}
    </div>
  );
}

export default function Conversation({ spaceId }: { spaceId: SpaceId }) {
  const { t, n, L, columnName } = useT();
  const messages = useStore((s) => s.messages[spaceId]);
  const members = useStore((s) => s.members);
  const memberCount = Object.keys(members).length;
  const card = useStore((s) => s.cards[spaceId]);
  const column = useStore((s) => (s.cards[spaceId] ? columnOf(s.columns, spaceId) : undefined));
  const log = useRef<HTMLDivElement>(null);
  const list = messages ?? [];

  const scrollToEnd = () => {
    log.current!.scrollTop = log.current!.scrollHeight;
  };
  useEffect(scrollToEnd, [list.length]);

  const general = spaceId === GENERAL_SPACE || !card;
  const title = general ? `# ${t.general}` : L(card.title);
  const sub = general || !column ? t.generalSub(n(memberCount)) : `${columnName(column)} · ${t.memberCount(n(card.memberIds.length))}`;
  const avatars = general ? Object.values(members) : card.memberIds.map((id) => members[id]);

  return (
    <section aria-label={title} className="flex h-full min-w-[420px] flex-1 flex-col bg-page">
      <div className="flex items-center gap-3 border-b border-hairline bg-surface px-6 py-3.5">
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 dir="auto" className="truncate text-[16px]/6 font-semibold text-heading">
            {title}
          </h2>
          <p className="text-[12px] text-muted">{sub}</p>
        </div>
        <AvatarStack members={avatars} size={26} ring="ring-surface" />
      </div>
      <div ref={log} role="log" aria-live="polite" className="tidy-scroll flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-6 py-5">
        {list.length === 0 && (
          <div className="m-auto flex flex-col items-center gap-1.5 px-5 py-10 text-center">
            <ChatIcon size={36} className="text-empty-icon" />
            <span className="text-[14px] font-semibold text-heading">{t.noMsgs}</span>
            <span className="text-[12.5px] text-muted">{t.noMsgsSub}</span>
          </div>
        )}
        {list.map((message) => (
          <MessageRow key={message.id} message={message} onImageLoad={scrollToEnd} />
        ))}
      </div>
      <Composer spaceId={spaceId} />
    </section>
  );
}
