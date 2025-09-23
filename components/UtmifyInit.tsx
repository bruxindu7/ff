"use client";

import { useEffect } from "react";

export default function UtmifyInit() {
  useEffect(() => {
    const checkUtmify = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).Utmify) {
        try {
          (window as any).Utmify.init({
            pixelId: "68d210e60acfc00e2c22a0dc",
            sendPageview: true,
          });
          console.log("✅ UTMify inicializado com sucesso");
          clearInterval(checkUtmify);
        } catch (err) {
          console.error("⚠️ Erro ao inicializar UTMify:", err);
        }
      }
    }, 500);

    return () => clearInterval(checkUtmify);
  }, []);

  return null;
}
