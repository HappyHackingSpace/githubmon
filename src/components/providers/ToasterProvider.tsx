"use client";

import { Toaster } from "sonner";
import { usePreferencesStore } from "@/stores/preferences";

export function ToasterProvider() {
  const theme = usePreferencesStore((state) => state.theme);

  return (
    <Toaster
      position="top-right"
      theme={theme === "dark" ? "dark" : "light"}
      richColors
      closeButton
      expand={false}
      duration={4000}
    />
  );
}
