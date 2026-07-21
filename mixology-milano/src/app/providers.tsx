"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

const [queryClient] = [
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, refetchOnWindowFocus: false },
    },
  }),
];

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}
const LocaleContext = createContext<LocaleContextValue>({
  locale: "it",
  setLocale: () => {},
});
export const useLocale = () => useContext(LocaleContext);

export function Providers({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("it");

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
    </QueryClientProvider>
  );
}
