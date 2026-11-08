import { useMemo } from "react";
import { useStore } from "../store";
import type { Column, Language, Text } from "../types";
import { formatJalaliDay, formatNumber, formatPercent } from "../utils";
import { en } from "./en";
import { fa } from "./fa";

export const dictionaries = { en, fa };

export function translator(language: Language) {
  const t = dictionaries[language];
  return {
    t,
    language,
    /** Resolves localized sample data; user-written text passes through untouched. */
    L: (text: Text) => (typeof text === "string" ? text : text[language]),
    n: (value: number | string) => formatNumber(value, language),
    pct: (value: number) => formatPercent(value, language),
    date: (iso: string) => formatJalaliDay(iso, language),
    columnName: (column: Pick<Column, "id" | "name">) => column.name ?? t.columns[column.id],
  };
}

export function useT() {
  const language = useStore((s) => s.language);
  return useMemo(() => translator(language), [language]);
}
