"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/state/AppStateContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

/** Local draft that re-syncs from the store until the user edits it. */
export function useDraft<T>(source: T): {
  draft: T;
  setDraft: (updater: (current: T) => T) => void;
  resetDraft: () => void;
} {
  const [draft, setDraftState] = useState<T>(source);
  const dirtyRef = useRef(false);
  const lastSourceRef = useRef(source);
  const lastSnapshotRef = useRef(JSON.stringify(source));

  useEffect(() => {
    // `source` is usually a fresh object each render; only re-sync when its
    // contents actually changed, or this effect would loop forever.
    const snapshot = JSON.stringify(source);
    if (dirtyRef.current || snapshot === lastSnapshotRef.current) return;
    lastSnapshotRef.current = snapshot;
    lastSourceRef.current = source;
    setDraftState(source);
  }, [source]);

  return {
    draft,
    setDraft: (updater) => {
      dirtyRef.current = true;
      setDraftState((current) => updater(current));
    },
    resetDraft: () => {
      dirtyRef.current = false;
      lastSnapshotRef.current = JSON.stringify(lastSourceRef.current);
      setDraftState(lastSourceRef.current);
    },
  };
}

export function SaveButton({
  onSave,
  label = "Save changes",
  className,
}: {
  onSave: () => boolean;
  label?: string;
  className?: string;
}) {
  const { showToast } = useAppState();
  const [savedFlash, setSavedFlash] = useState(false);

  return (
    <Button
      className={className}
      onClick={() => {
        if (onSave()) {
          showToast("Saved. She'll see it immediately. ✅");
          setSavedFlash(true);
          window.setTimeout(() => setSavedFlash(false), 1600);
        }
      }}
    >
      {savedFlash ? <Check className="h-4 w-4" aria-hidden /> : null}
      {savedFlash ? "Saved" : label}
    </Button>
  );
}

export function SettingsSection({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {children}
        {footer && <div className="flex justify-end">{footer}</div>}
      </CardContent>
    </Card>
  );
}
