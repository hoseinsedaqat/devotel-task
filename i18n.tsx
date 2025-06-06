"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface I18nContextType {
  locale: string;
  messages: Record<string, string>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Helper translation function
export function t(key: string, i18n: I18nContextType) {
  return i18n.messages[key] || key;
}
