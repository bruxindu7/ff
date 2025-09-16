"use client";

import { useState, useCallback } from "react";

type ToastType = "error" | "success";

export function useToast() {
  const [toasts, setToasts] = useState<
    { id: string; type: ToastType; title: string; message: string }[]
  >([]);

  const showToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // remove depois de 4s sem animação
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 8000);
  }, []);

  const Toasts = () => (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <strong>{t.title}</strong>
          <p>{t.message}</p>
        </div>
      ))}
    </div>
  );

  return { showToast, Toasts };
}
