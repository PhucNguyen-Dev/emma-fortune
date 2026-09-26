import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { AppStateProvider } from "@/lib/state/AppStateContext";
import { createDefaultState } from "@/lib/config/defaults";
import { STORAGE_KEY } from "@/lib/storage/repository";
import type { AppState } from "@/types";

export function seedStorage(overrides: Partial<AppState> = {}): AppState {
  const state: AppState = { ...createDefaultState(), ...overrides };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function readStoredState(): AppState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as AppState;
}

export function clearStorage(): void {
  window.localStorage.clear();
}

export function renderWithProviders(
  ui: ReactElement,
  options: Omit<RenderOptions, "wrapper"> = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <AppStateProvider>{children}</AppStateProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}
