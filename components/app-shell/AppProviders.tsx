"use client";

import { useState, type ReactNode } from "react";
import { AppStateProvider, useAppState } from "@/lib/state/AppStateContext";
import { AppShell } from "@/components/app-shell/AppShell";

function Toasts() {
  const { toasts, dismissToast } = useAppState();
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed inset-x-4 bottom-24 z-[70] flex flex-col items-center gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={`pointer-events-auto w-full max-w-sm rounded-xl px-4 py-3 text-left text-sm shadow-(--shadow-luxe) transition-colors ${
            toast.tone === "error"
              ? "bg-rose-deep text-white"
              : toast.tone === "info"
                ? "bg-plum text-ivory"
                : "bg-plum text-ivory"
          }`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}

function RecoveryBanner() {
  const { recoveryNotice, dismissRecoveryNotice } = useAppState();
  const [closed, setClosed] = useState(false);
  if (!recoveryNotice || closed) return null;
  return (
    <div
      role="status"
      className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6"
    >
      <div className="flex items-start gap-3 rounded-xl border border-champagne/60 bg-champagne/15 px-4 py-3 text-sm text-plum">
        <span className="flex-1">{recoveryNotice}</span>
        <button
          type="button"
          onClick={() => {
            setClosed(true);
            dismissRecoveryNotice();
          }}
          className="shrink-0 rounded-lg px-2 py-1 font-semibold text-plum underline-offset-2 hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <AppShell recoverySlot={<RecoveryBanner />} toastSlot={<Toasts />}>
        {children}
      </AppShell>
    </AppStateProvider>
  );
}
