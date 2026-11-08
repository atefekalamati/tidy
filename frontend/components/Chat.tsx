"use client";

import { useStore } from "@/lib/store";
import { GENERAL_SPACE } from "@/data/seed";
import Conversation from "./Conversation";
import TaskPanel from "./TaskPanel";

export default function Chat() {
  const space = useStore((s) => s.activeSpace);
  const hasTask = useStore((s) => space !== GENERAL_SPACE && !!s.cards[space]);

  return (
    <main className="tidy-scroll flex min-h-0 flex-1 overflow-x-auto">
      <Conversation key={space} spaceId={space} />
      {hasTask && <TaskPanel key={`panel-${space}`} cardId={space} />}
    </main>
  );
}
