import { createSeed, seedMembers } from "@/data/seed";
import type { Card, ColumnId, Density, Language, Member, Message, Priority, Text, View } from "./types";

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);
const isLanguage = (value: unknown): value is Language => value === "en" || value === "fa";
const isDensity = (value: unknown): value is Density => value === "comfortable" || value === "compact";
const isView = (value: unknown): value is View => value === "board" || value === "chat";
const isPriority = (value: unknown): value is Priority => value === "low" || value === "medium" || value === "high";
const columnIds: ColumnId[] = ["ideas", "todo", "doing", "review", "done"];

function mapColumnId(value: unknown): ColumnId | undefined {
  if (!isString(value)) return undefined;
  const normalized = value.toLowerCase().replace(/[\s-]+/g, "_");
  if (columnIds.includes(normalized as ColumnId)) return normalized as ColumnId;
  if (normalized === "in_progress" || normalized === "inprogress") return "doing";
  if (normalized === "in_review" || normalized === "inreview") return "review";
  return undefined;
}

function asLocalized(value: unknown, fallback: string) {
  if (isString(value)) return { en: value, fa: value };
  if (isRecord(value) && isString(value.en) && isString(value.fa)) return { en: value.en, fa: value.fa };
  return { en: fallback, fa: fallback };
}

function isText(value: unknown): value is Text {
  return isString(value) || (isRecord(value) && isString(value.en) && isString(value.fa));
}

function isMessage(value: unknown): value is Message {
  if (!isRecord(value) || !isString(value.id) || !isString(value.authorId) || !isString(value.time)) return false;
  if (value.type === "message") {
    const validText = value.text === undefined || isText(value.text);
    const validImage =
      value.image === undefined ||
      (isRecord(value.image) && isString(value.image.file) && (value.image.src === undefined || isString(value.image.src)));
    return validText && validImage;
  }
  if (value.type === "task") return isString(value.cardId);
  if (value.type !== "event") return false;
  if (value.event === "progress") return typeof value.value === "number" && Number.isFinite(value.value);
  if (value.event === "added" || value.event === "removed") return isString(value.memberId);
  return value.event === "moved" && mapColumnId(value.columnId) !== undefined;
}

function migrateMessages(value: unknown, cardIds: Set<string>): Record<string, Message[]> {
  if (value === undefined) return { general: [] };
  if (!isRecord(value)) throw new Error("The saved conversations could not be migrated safely.");
  const messages: Record<string, Message[]> = {};
  for (const [spaceId, entries] of Object.entries(value)) {
    if (!Array.isArray(entries) || !entries.every(isMessage)) {
      throw new Error("A saved conversation has an unsupported message. The original data is backed up.");
    }
    if (entries.some((message) => message.type === "task" && !cardIds.has(message.cardId))) {
      throw new Error("A saved conversation references a missing task. The original data is backed up.");
    }
    messages[spaceId] = entries;
  }
  return messages;
}

function makeCard(id: string, value: RecordValue): Card {
  const legacyMembers = isStringArray(value.memberIds)
    ? value.memberIds
    : isStringArray(value.assigneeIds)
      ? value.assigneeIds
      : isString(value.assigneeId)
        ? [value.assigneeId]
        : isString(value.assignee)
          ? [value.assignee]
          : [];
  const progress = typeof value.progress === "number" && Number.isFinite(value.progress)
    ? Math.max(0, Math.min(100, value.progress))
    : 0;
  const title = value.title;
  if (!isText(title)) throw new Error(`Task "${id}" has no supported title. The original data is backed up.`);

  return {
    ...value,
    id,
    title,
    details: isText(value.details) ? value.details : isText(value.description) ? value.description : "",
    priority: isPriority(value.priority) ? value.priority : "medium",
    dueDate: isString(value.dueDate) ? value.dueDate : null,
    labelIds: isStringArray(value.labelIds) ? value.labelIds : [],
    memberIds: legacyMembers,
    progress,
  };
}

function makeMembers(value: unknown, cards: Record<string, Card>, messages: Record<string, Message[]>): Record<string, Member> {
  const members: Record<string, Member> = { ...seedMembers };
  const legacyMembers = isRecord(value) ? value : {};
  const memberIds = new Set([
    ...Object.values(cards).flatMap((card) => card.memberIds),
    ...Object.values(messages)
      .flat()
      .flatMap((message) =>
        message.type === "event" && (message.event === "added" || message.event === "removed") ? [message.memberId] : [],
      ),
  ]);

  for (const id of memberIds) {
    if (members[id]) continue;
    const legacy = legacyMembers[id];
    const member = isRecord(legacy) ? legacy : {};
    members[id] = {
      id,
      name: asLocalized(member.name, id),
      initials: asLocalized(member.initials, id.slice(0, 2).toUpperCase()),
    };
  }
  return members;
}

export function migrateLegacyState(value: unknown) {
  if (!isRecord(value)) throw new Error("The saved V1 data has an unsupported format. The original data is backed up.");
  if (!isRecord(value.cards)) throw new Error("The saved V1 tasks could not be read. The original data is backed up.");

  const rawCardsById: Record<string, RecordValue> = {};
  const cardEntries = Object.entries(value.cards).map(([key, card]) => {
    if (!isRecord(card)) throw new Error(`Task "${key}" has an unsupported format. The original data is backed up.`);
    const id = isString(card.id) ? card.id : key;
    if (rawCardsById[id]) throw new Error(`Task id "${id}" is duplicated. The original data is backed up.`);
    rawCardsById[id] = card;
    return [id, makeCard(id, card)] as const;
  });
  const cards = Object.fromEntries(cardEntries);
  const seed = createSeed();
  const columns = seed.columns.map((column) => ({ ...column, cardIds: [] as string[] }));
  const assigned = new Set<string>();

  if (Array.isArray(value.columns)) {
    for (const legacyColumn of value.columns) {
      if (!isRecord(legacyColumn)) continue;
      const columnId = mapColumnId(legacyColumn.id);
      if (!isStringArray(legacyColumn.cardIds)) continue;
      const column = columns.find((item) => item.id === (columnId ?? "todo"))!;
      if (columnId && isString(legacyColumn.name)) column.name = legacyColumn.name;
      if (columnId && legacyColumn.wipLimit === null) column.wipLimit = null;
      else if (columnId && typeof legacyColumn.wipLimit === "number" && Number.isFinite(legacyColumn.wipLimit)) {
        column.wipLimit = legacyColumn.wipLimit;
      }
      if (columnId && typeof legacyColumn.collapsed === "boolean") column.collapsed = legacyColumn.collapsed;
      for (const id of legacyColumn.cardIds) {
        if (cards[id] && !assigned.has(id)) {
          column.cardIds.push(id);
          assigned.add(id);
        }
      }
    }
  }

  for (const id of Object.keys(cards)) {
    if (assigned.has(id)) continue;
    const rawCard = rawCardsById[id];
    const target = mapColumnId(rawCard.columnId ?? rawCard.status);
    columns.find((column) => column.id === (target ?? "todo"))!.cardIds.push(id);
  }

  const messages = migrateMessages(value.messages, new Set(Object.keys(cards)));
  const members = makeMembers(value.members, cards, messages);
  const unread = isRecord(value.unread)
    ? Object.fromEntries(Object.entries(value.unread).filter((entry): entry is [string, number] =>
        isString(entry[0]) && typeof entry[1] === "number" && Number.isFinite(entry[1]) && entry[1] > 0,
      ))
    : {};
  const activeSpace = isString(value.activeSpace) && (value.activeSpace === "general" || cards[value.activeSpace])
    ? value.activeSpace
    : "general";

  return {
    ...seed,
    cards,
    columns,
    members,
    messages,
    unread,
    language: isLanguage(value.language) ? value.language : "en",
    density: isDensity(value.density) ? value.density : "comfortable",
    view: isView(value.view) ? value.view : "board",
    activeSpace,
  };
}
