export type Language = "en" | "fa";

export interface LocalizedText {
  en: string;
  fa: string;
}

/** Sample data is localized; text the user writes is a plain string and is never translated. */
export type Text = string | LocalizedText;

export type Priority = "low" | "medium" | "high";
export type ColumnId = "ideas" | "todo" | "doing" | "review" | "done";
export type Density = "comfortable" | "compact";
export type View = "board" | "chat";

/** "general" or a card id: every card has its own task room. */
export type SpaceId = string;

export interface Column {
  id: ColumnId;
  /** Set only when the user renames the column; otherwise the translated default is shown. */
  name?: string;
  cardIds: string[];
  wipLimit: number | null;
  collapsed: boolean;
}

export interface Card {
  id: string;
  title: Text;
  details: Text;
  priority: Priority;
  /** Gregorian date as yyyy-MM-dd; always displayed in the Jalali calendar. */
  dueDate: string | null;
  labelIds: string[];
  memberIds: string[];
  progress: number;
}

export type CardInput = Omit<Card, "id" | "progress">;

export interface Member {
  id: string;
  name: LocalizedText;
  initials: LocalizedText;
}

export interface Label {
  id: string;
  name: LocalizedText;
}

interface MessageBase {
  id: string;
  authorId: string;
  /** Local time as HH:mm. */
  time: string;
}

export interface ImageRef {
  /** Data URL of an upload. Sample images have none and render as a placeholder. */
  src?: string;
  file: string;
}

export interface ChatMessage extends MessageBase {
  type: "message";
  text?: Text;
  image?: ImageRef;
}

export type SystemEvent =
  | { event: "progress"; value: number }
  | { event: "added" | "removed"; memberId: string }
  | { event: "moved"; columnId: ColumnId };

export type EventMessage = MessageBase & { type: "event" } & SystemEvent;

export interface TaskMessage extends MessageBase {
  type: "task";
  cardId: string;
}

export type Message = ChatMessage | EventMessage | TaskMessage;

/** Everything needed to put a deleted card back exactly where it was. */
export interface DeletedCard {
  card: Card;
  columnId: ColumnId;
  columnIndex: number;
  /** Position among all cards, which is the order of the task rooms list. */
  roomIndex: number;
  room?: Message[];
  unread?: number;
  announcements: { spaceId: SpaceId; index: number; message: Message }[];
  wasActiveSpace: boolean;
}

export type Dialog = { type: "help" } | { type: "card"; columnId: ColumnId; cardId?: string };
