import { addDays } from "date-fns-jalali";
import type { Card, Column, ColumnId, Label, Member, Message, Priority, Text } from "@/lib/types";
import { toISODate } from "@/lib/utils";

export const CURRENT_USER_ID = "sara";
export const GENERAL_SPACE = "general";
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const seedMembers: Record<string, Member> = {
  sara: { id: "sara", name: { en: "Atefe Kalamati", fa: "عاطفه کلماتی" }, initials: { en: "AK", fa: "عک" } },
  ali: { id: "ali", name: { en: "Ali Rezaei", fa: "علی رضایی" }, initials: { en: "AR", fa: "عر" } },
  maryam: { id: "maryam", name: { en: "Maryam Karimi", fa: "مریم کریمی" }, initials: { en: "MK", fa: "مک" } },
  reza: { id: "reza", name: { en: "Reza Mohammadi", fa: "رضا محمدی" }, initials: { en: "RM", fa: "رم" } },
};

export const labels: Label[] = [
  { id: "design", name: { en: "Design", fa: "طراحی" } },
  { id: "frontend", name: { en: "Frontend", fa: "فرانت‌اند" } },
  { id: "bug", name: { en: "Bug", fa: "باگ" } },
  { id: "docs", name: { en: "Docs", fa: "مستندات" } },
  { id: "testing", name: { en: "Testing", fa: "تست" } },
];

interface SeedCard {
  id: string;
  column: ColumnId;
  title: Text;
  details: Text;
  priority: Priority;
  labelIds: string[];
  memberIds: string[];
  progress: number;
  /** Days from the day the sample data is created. On 17 Aban these match the design. */
  dueIn?: number;
}

const seedCards: SeedCard[] = [
  {
    id: "c1",
    column: "ideas",
    title: { en: "Board progress bar", fa: "نوار پیشرفت تخته" },
    details: { en: "Show the share of finished cards in the board header.", fa: "نمایش درصد کارت‌های انجام‌شده در سربرگ تخته." },
    priority: "low",
    labelIds: ["design"],
    memberIds: ["maryam"],
    progress: 0,
  },
  {
    id: "c2",
    column: "ideas",
    title: { en: "Keyboard shortcut sheet", fa: "راهنمای میانبرها" },
    details: { en: "Open a cheat sheet with the ? key.", fa: "باز شدن راهنما با کلید ?" },
    priority: "low",
    labelIds: ["frontend"],
    memberIds: [],
    progress: 0,
  },
  {
    id: "c3",
    column: "todo",
    title: { en: "Empty column state", fa: "طراحی حالت خالی ستون" },
    details: { en: "A friendly message and quick add when a column has no cards.", fa: "پیام دوستانه و افزودن سریع وقتی ستونی کارت ندارد." },
    priority: "high",
    labelIds: ["design"],
    memberIds: ["sara"],
    progress: 10,
    dueIn: 3,
  },
  {
    id: "c4",
    column: "todo",
    title: { en: "Column unit tests", fa: "تست‌های واحد ستون‌ها" },
    details: { en: "Cover add, delete and rename with Vitest.", fa: "پوشش افزودن، حذف و تغییر نام با Vitest." },
    priority: "medium",
    labelIds: ["testing"],
    memberIds: ["ali"],
    progress: 0,
    dueIn: 8,
  },
  {
    id: "c5",
    column: "doing",
    title: { en: "Drag and drop cards", fa: "کشیدن و رها کردن کارت‌ها" },
    details: { en: "dnd-kit with keyboard support and a drop indicator line.", fa: "پیاده‌سازی با dnd-kit همراه با صفحه‌کلید و خط محل فرود." },
    priority: "high",
    labelIds: ["frontend"],
    memberIds: ["ali", "sara"],
    progress: 60,
    dueIn: 0,
  },
  {
    id: "c6",
    column: "doing",
    title: { en: "Jalali date picker", fa: "انتخابگر تاریخ شمسی" },
    details: { en: "Wire react-multi-date-picker to the Persian calendar.", fa: "اتصال react-multi-date-picker به تقویم شمسی." },
    priority: "medium",
    labelIds: ["frontend"],
    memberIds: ["maryam"],
    progress: 35,
    dueIn: -2,
  },
  {
    id: "c7",
    column: "doing",
    title: { en: "Task chat room", fa: "اتاق گفتگوی کار" },
    details: { en: "Group chat per task with images, members and progress updates.", fa: "گفتگوی گروهی برای هر کار، با عکس، اعضا و گزارش پیشرفت." },
    priority: "medium",
    labelIds: ["design", "frontend"],
    memberIds: ["sara", "reza", "maryam"],
    progress: 45,
    dueIn: 1,
  },
  {
    id: "c8",
    column: "review",
    title: { en: "Fix mixed text direction", fa: "اصلاح جهت متن ترکیبی" },
    details: { en: "Persian text keeps its own direction inside the English UI.", fa: "متن فارسی در رابط انگلیسی جهت خودش را حفظ کند." },
    priority: "high",
    labelIds: ["bug"],
    memberIds: ["sara"],
    progress: 90,
    dueIn: 2,
  },
  {
    id: "c9",
    column: "done",
    title: { en: "Set up Next.js project", fa: "راه‌اندازی پروژه Next.js" },
    details: { en: "Scaffold, Tailwind and .gitignore.", fa: "ساختار اولیه، Tailwind و ‎.gitignore" },
    priority: "low",
    labelIds: ["docs"],
    memberIds: ["reza"],
    progress: 100,
    dueIn: -7,
  },
  {
    id: "c10",
    column: "done",
    title: { en: "Write AGENTS.md", fa: "نوشتن AGENTS.md" },
    details: { en: "Requirements, palette and delivery plan.", fa: "نیازمندی‌ها، پالت رنگ و راهبرد اجرا." },
    priority: "medium",
    labelIds: ["docs"],
    memberIds: ["sara"],
    progress: 100,
    dueIn: -12,
  },
];

const seedMessages: Record<string, Message[]> = {
  general: [
    { id: "g1", type: "message", authorId: "reza", time: "09:02", text: { en: "Morning team! Standup notes are in the Docs cards.", fa: "صبح بخیر تیم! یادداشت‌های جلسه‌ی صبح در کارت‌های مستندات است." } },
    { id: "g2", type: "task", authorId: "sara", time: "09:10", cardId: "c7" },
    { id: "g3", type: "message", authorId: "maryam", time: "09:24", image: { file: "empty-states-moodboard.png" }, text: { en: "Moodboard for the empty column states", fa: "مودبورد حالت‌های خالی ستون" } },
    { id: "g4", type: "message", authorId: "ali", time: "09:31", text: { en: "Drag and drop is at 60%. Keyboard moves are next.", fa: "کشیدن و رها کردن ۶۰٪ پیش رفته. قدم بعدی جابه‌جایی با صفحه‌کلید است." } },
    { id: "g5", type: "message", authorId: "sara", time: "09:33", text: { en: "Great progress. Let us review it together after lunch.", fa: "عالیه. بعد از ناهار با هم مرورش کنیم." } },
  ],
  c7: [
    { id: "r1", type: "event", event: "added", authorId: "sara", memberId: "reza", time: "09:11" },
    { id: "r2", type: "event", event: "added", authorId: "sara", memberId: "maryam", time: "09:11" },
    { id: "r3", type: "message", authorId: "maryam", time: "10:05", image: { file: "chat-panel-v1.png" }, text: { en: "First layout for the chat panel.", fa: "اولین چیدمان پنل گفتگو." } },
    { id: "r4", type: "message", authorId: "reza", time: "10:12", text: { en: "Looks clean. Can progress updates show as small events in the thread?", fa: "تمیز شده. می‌شود گزارش‌های پیشرفت را به شکل رویدادهای کوچک در گفتگو نشان داد؟" } },
    { id: "r5", type: "event", event: "progress", authorId: "sara", value: 45, time: "10:20" },
    { id: "r6", type: "message", authorId: "sara", time: "10:21", text: { en: "Done. Next up: image upload in the composer.", fa: "انجام شد. قدم بعدی: آپلود عکس در کادر پیام." } },
  ],
  c5: [
    { id: "d1", type: "message", authorId: "ali", time: "08:40", text: { en: "Pointer drag works across all columns.", fa: "کشیدن با موس بین همه‌ی ستون‌ها کار می‌کند." } },
    { id: "d2", type: "event", event: "progress", authorId: "ali", value: 60, time: "08:41" },
  ],
};

const columnSetup: { id: ColumnId; wipLimit: number | null }[] = [
  { id: "ideas", wipLimit: null },
  { id: "todo", wipLimit: null },
  { id: "doing", wipLimit: 3 },
  { id: "review", wipLimit: 2 },
  { id: "done", wipLimit: null },
];

export function createSeed(now = new Date()) {
  const columns: Column[] = columnSetup.map((c) => ({
    ...c,
    collapsed: false,
    cardIds: seedCards.filter((card) => card.column === c.id).map((card) => card.id),
  }));

  const cards = Object.fromEntries(
    seedCards.map(({ column: _column, dueIn, ...card }): [string, Card] => [
      card.id,
      { ...card, dueDate: dueIn === undefined ? null : toISODate(addDays(now, dueIn)) },
    ]),
  );

  return {
    columns,
    cards,
    members: seedMembers,
    messages: seedMessages,
    unread: { general: 2, c7: 1 } as Record<string, number>,
  };
}
