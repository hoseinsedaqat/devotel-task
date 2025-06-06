"use client";

interface LanguageToggleProps {
  currentLocale: string;
  onChange: (newLocale: string) => void;
}

export default function LanguageToggle({ currentLocale, onChange }: LanguageToggleProps) {
  const toggleLanguage = () => {
    onChange(currentLocale === "en" ? "fa" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      style={{
        padding: "6px 12px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        backgroundColor: "#4F46E5",
        color: "white",
        fontWeight: "600",
      }}
      aria-label="Toggle language"
    >
      {currentLocale === "en" ? "فارسی" : "English"}
    </button>
  );
}
