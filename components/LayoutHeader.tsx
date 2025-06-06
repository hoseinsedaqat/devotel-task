"use client";

import { useRouter, useSearchParams } from "next/navigation";
import LanguageToggle from "./LanguageToggle";

interface LayoutHeaderProps {
  currentLocale: string;
}

export default function LayoutHeader({ currentLocale }: LayoutHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLocaleChange = (newLocale: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("locale", newLocale);
    router.push(`?${params.toString()}`);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        padding: "12px",
      }}
    >
      <LanguageToggle currentLocale={currentLocale} onChange={handleLocaleChange} />
      {/* <ThemeToggle /> */}
    </div>
  );
}
