import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import t from "./translations";
import type { Lang } from "./translations";

export type { Lang };

export function useT() {
  const ctx = useContext(AppContext);
  const lang: Lang = (ctx as any).language ?? "en";
  return t[lang] ?? t["en"];
}

export function useLang(): { language: Lang; setLanguage: (l: Lang) => void } {
  const ctx = useContext(AppContext) as any;
  return {
    language: ctx.language ?? "en",
    setLanguage: ctx.setLanguage ?? (() => {}),
  };
}
