"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppConfig,
  AppPreferences,
  AppState,
  Coupon,
  FundContribution,
  WishlistItem,
} from "@/types";
import { createDefaultState } from "@/lib/config/defaults";
import {
  getShopItem,
  shopCategoryToWishlistCategory,
} from "@/lib/config/shop";
import { createId } from "@/lib/ids";
import {
  STORAGE_KEY,
  clearAppState,
  loadAppState,
  saveAppState,
} from "@/lib/storage/repository";
import {
  currentLoveBalance,
  fundAvailableToTransfer,
  rollSpecialCard,
} from "@/lib/utils/bank";

type Action =
  | { type: "HYDRATE"; state: AppState }
  | { type: "PATCH_CONFIG"; patch: Partial<AppConfig> }
  | { type: "COUPON_REDEEM"; couponId: string; note?: string; at: string; transactionId: string }
  | { type: "COUPONS_SET"; coupons: Coupon[] }
  | { type: "COUPONS_RESET" }
  | {
      type: "SHOP_PURCHASE";
      itemId: string;
      label: string;
      price: number;
      at: string;
      transactionId: string;
      specialAppeared: boolean;
    }
  | {
      type: "TRANSFER";
      /** fund-to-bank brings coins INTO the bank; bank-to-fund sends them OUT. */
      direction: "fund-to-bank" | "bank-to-fund";
      amount: number;
      at: string;
      transactionId: string;
    }
  | { type: "SPECIAL_REVEAL"; at: string }
  | { type: "SPECIAL_RESET" }
  | { type: "CONTRIBUTION_ADD"; contribution: FundContribution }
  | { type: "CONTRIBUTION_UPDATE"; id: string; patch: Partial<FundContribution> }
  | { type: "CONTRIBUTION_DELETE"; id: string }
  | { type: "FUND_PATCH"; patch: Partial<AppConfig["fund"]> }
  | { type: "WISH_ADD"; item: WishlistItem }
  | { type: "WISH_UPDATE"; id: string; patch: Partial<WishlistItem> }
  | { type: "WISH_DELETE"; id: string }
  | { type: "PREFERENCES_PATCH"; patch: AppPreferences }
  | { type: "REPLACE_STATE"; state: AppState }
  | { type: "RESET_DEMO" }
  | { type: "RESET_ALL" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "PATCH_CONFIG":
      return { ...state, config: { ...state.config, ...action.patch } };
    case "COUPON_REDEEM": {
      const coupon = state.coupons.find((entry) => entry.id === action.couponId);
      if (!coupon || coupon.status === "redeemed") return state;
      const redeemed: Coupon = {
        ...coupon,
        status: "redeemed",
        redeemedAt: action.at,
        redemptionNote:
          action.note && action.note.trim().length > 0 ? action.note.trim() : undefined,
      };
      return {
        ...state,
        coupons: state.coupons.map((entry) => (entry.id === action.couponId ? redeemed : entry)),
        transactions: [
          {
            id: action.transactionId,
            couponId: action.couponId,
            couponTitle: coupon.title,
            fictionalPointCost: coupon.fictionalPointCost,
            createdAt: action.at,
            kind: "redemption",
            direction: "out",
          },
          ...state.transactions,
        ],
      };
    }
    case "COUPONS_SET":
      return { ...state, coupons: action.coupons };
    case "COUPONS_RESET":
      return {
        ...state,
        coupons: state.coupons.map((coupon) => ({
          ...coupon,
          status: "available" as const,
          redeemedAt: undefined,
          redemptionNote: undefined,
        })),
        transactions: [],
      };
    case "SHOP_PURCHASE": {
      // Every treasure she buys also lands in her wishlist, so she can keep
      // dreaming about it in the real world — deduped per shop item.
      const item = getShopItem(action.itemId);
      const alreadyWished =
        item !== undefined &&
        state.wishlist.some((entry) => entry.shopItemId === action.itemId);
      const now = new Date().toISOString();
      const wishlist = alreadyWished
        ? state.wishlist
        : [
            {
              id: `wish-${action.transactionId}`,
              name: action.label.split(" · ")[0] ?? (item?.kind ?? "A lovely treasure"),
              category: shopCategoryToWishlistCategory(item?.category),
              description: "A little something I treated myself to in the Boutique.",
              brand: item?.brand,
              shopItemId: action.itemId,
              priority: "high" as const,
              status: "dreaming" as const,
              favorite: false,
              createdAt: now,
              updatedAt: now,
            },
            ...state.wishlist,
          ];
      return {
        ...state,
        wishlist,
        transactions: [
          {
            id: action.transactionId,
            couponId: action.itemId,
            couponTitle: action.label,
            fictionalPointCost: action.price,
            createdAt: action.at,
            kind: "purchase",
            direction: "out",
          },
          ...state.transactions,
        ],
        specialCard: action.specialAppeared ? { ...state.specialCard, found: true } : state.specialCard,
      };
    }
    case "TRANSFER": {
      const toBank = action.direction === "fund-to-bank";
      return {
        ...state,
        transactions: [
          {
            id: action.transactionId,
            couponId: `transfer-${action.transactionId}`,
            couponTitle: toBank ? "A gift from your Future Fund" : "Coins sent home to your Future Fund",
            fictionalPointCost: action.amount,
            createdAt: action.at,
            kind: "transfer",
            direction: toBank ? "in" : "out",
          },
          ...state.transactions,
        ],
      };
    }
    case "SPECIAL_REVEAL":
      return {
        ...state,
        specialCard: { ...state.specialCard, revealedAt: action.at },
      };
    case "SPECIAL_RESET":
      return { ...state, specialCard: { found: false } };
    case "CONTRIBUTION_ADD":
      return { ...state, contributions: [action.contribution, ...state.contributions] };
    case "CONTRIBUTION_UPDATE":
      return {
        ...state,
        contributions: state.contributions.map((entry) =>
          entry.id === action.id ? { ...entry, ...action.patch } : entry,
        ),
      };
    case "CONTRIBUTION_DELETE":
      return {
        ...state,
        contributions: state.contributions.filter((entry) => entry.id !== action.id),
      };
    case "FUND_PATCH":
      return {
        ...state,
        config: { ...state.config, fund: { ...state.config.fund, ...action.patch } },
      };
    case "WISH_ADD":
      return { ...state, wishlist: [action.item, ...state.wishlist] };
    case "WISH_UPDATE":
      return {
        ...state,
        wishlist: state.wishlist.map((item) =>
          item.id === action.id ? { ...item, ...action.patch, updatedAt: new Date().toISOString() } : item,
        ),
      };
    case "WISH_DELETE":
      return { ...state, wishlist: state.wishlist.filter((item) => item.id !== action.id) };
    case "PREFERENCES_PATCH":
      return { ...state, preferences: { ...state.preferences, ...action.patch } };
    case "REPLACE_STATE":
      return action.state;
    case "RESET_DEMO": {
      const fresh = createDefaultState();
      return {
        ...fresh,
        config: state.config,
        preferences: { ...state.preferences, fundGoalReached: false },
      };
    }
    case "RESET_ALL":
      return createDefaultState();
    default:
      return state;
  }
}

export type Toast = {
  id: string;
  message: string;
  tone: "success" | "error" | "info";
};

type PurchaseResult = { ok: true; specialAppeared: boolean } | { ok: false; reason: "not-found" | "insufficient" };

type AppStateStore = {
  state: AppState;
  hydrated: boolean;
  /** Non-blocking notice when saved data could not be fully read. */
  recoveryNotice: string | null;
  dismissRecoveryNotice: () => void;
  toasts: Toast[];
  showToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;
  patchConfig: (patch: Partial<AppConfig>) => void;
  redeemCoupon: (couponId: string, note?: string) => boolean;
  setCoupons: (coupons: Coupon[]) => void;
  resetCoupons: () => void;
  buyShopItem: (itemId: string) => PurchaseResult;
  transferFundToBank: (amount: number) => boolean;
  transferBankToFund: (amount: number) => boolean;
  markSpecialRevealed: () => void;
  resetSpecialCard: () => void;
  addContribution: (input: { amount: number; date: string; note?: string }) => void;
  updateContribution: (id: string, patch: Partial<FundContribution>) => void;
  deleteContribution: (id: string) => void;
  patchFund: (patch: Partial<AppConfig["fund"]>) => void;
  addWishlistItem: (input: Omit<WishlistItem, "id" | "createdAt" | "updatedAt">) => void;
  updateWishlistItem: (id: string, patch: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;
  toggleWishlistFavorite: (id: string) => void;
  patchPreferences: (patch: AppPreferences) => void;
  replaceState: (next: AppState) => void;
  resetDemoData: () => void;
  resetAllData: () => void;
};

const AppStateContext = createContext<AppStateStore | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createDefaultState);
  const [hydrated, setHydrated] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const suppressPersistRef = useRef(true);

  // Hydrate from localStorage after mount so SSR markup and first client render match.
  useEffect(() => {
    const result = loadAppState();
    suppressPersistRef.current = true;
    dispatch({ type: "HYDRATE", state: result.state });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from an external system (browser storage) can only happen after mount
    setHydrated(true);
    if (result.error === "corrupt") {
      setRecoveryNotice(
        "We couldn't read your saved data (it looked damaged), so the app started fresh. A copy of the old data is kept in this browser under “emma-fortune:v1:corrupt-backup”.",
      );
    } else if (result.error === "unsupported") {
      setRecoveryNotice(
        "Your saved data was made by a newer version of this app, so it can't be opened here. Defaults are being used instead.",
      );
    } else if (result.recovered) {
      setRecoveryNotice(
        "Some saved information couldn't be read and was reset to defaults. Everything else was kept.",
      );
    }
  }, []);

  // Persist after every meaningful change; validate before each write.
  useEffect(() => {
    if (!hydrated) return;
    if (suppressPersistRef.current) {
      suppressPersistRef.current = false;
      return;
    }
    const result = saveAppState(state);
    if (!result.ok && result.reason !== "invalid") {
      const message =
        result.reason === "quota"
          ? "This browser ran out of local storage space. Your last change may not be saved."
          : "Changes could not be saved to this browser's storage.";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- surfacing a storage-system failure detected while persisting
      setToasts((current) => [
        ...current.slice(-2),
        { id: createId(), message, tone: "error" },
      ]);
    }
  }, [state, hydrated]);

  // Keep multiple open tabs in sync.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || event.newValue === null) return;
      try {
        const parsed = JSON.parse(event.newValue) as AppState;
        if (parsed?.schemaVersion !== 1) return;
        suppressPersistRef.current = true;
        dispatch({ type: "REPLACE_STATE", state: parsed });
      } catch {
        // ignore malformed cross-tab updates
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const showToast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = createId();
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const store = useMemo<AppStateStore>(() => {
    return {
      state,
      hydrated,
      recoveryNotice,
      dismissRecoveryNotice: () => setRecoveryNotice(null),
      toasts,
      showToast,
      dismissToast,
      patchConfig: (patch) => dispatch({ type: "PATCH_CONFIG", patch }),
      redeemCoupon: (couponId, note) => {
        const coupon = state.coupons.find((entry) => entry.id === couponId);
        if (!coupon || coupon.status === "redeemed") return false;
        dispatch({
          type: "COUPON_REDEEM",
          couponId,
          note,
          at: new Date().toISOString(),
          transactionId: createId(),
        });
        return true;
      },
      resetCoupons: () => dispatch({ type: "COUPONS_RESET" }),
      setCoupons: (coupons) => dispatch({ type: "COUPONS_SET", coupons }),
      buyShopItem: (itemId) => {
        const item = getShopItem(itemId);
        if (!item) return { ok: false, reason: "not-found" };
        const balance = currentLoveBalance(state.transactions);
        if (balance < item.price) return { ok: false, reason: "insufficient" };
        const specialAppeared =
          !state.specialCard.found &&
          rollSpecialCard(state.config.specialCard.ratePercent);
        dispatch({
          type: "SHOP_PURCHASE",
          itemId,
          label: `${item.name} · ${item.brand}`,
          price: item.price,
          at: new Date().toISOString(),
          transactionId: createId(),
          specialAppeared,
        });
        return { ok: true, specialAppeared };
      },
      transferFundToBank: (amount) => {
        const available = fundAvailableToTransfer(state.contributions, state.transactions);
        if (!Number.isFinite(amount) || amount <= 0 || amount > available) return false;
        dispatch({
          type: "TRANSFER",
          direction: "fund-to-bank",
          amount,
          at: new Date().toISOString(),
          transactionId: createId(),
        });
        return true;
      },
      transferBankToFund: (amount) => {
        const balance = currentLoveBalance(state.transactions);
        if (!Number.isFinite(amount) || amount <= 0 || amount > balance) return false;
        dispatch({
          type: "TRANSFER",
          direction: "bank-to-fund",
          amount,
          at: new Date().toISOString(),
          transactionId: createId(),
        });
        return true;
      },
      markSpecialRevealed: () =>
        dispatch({ type: "SPECIAL_REVEAL", at: new Date().toISOString() }),
      resetSpecialCard: () => dispatch({ type: "SPECIAL_RESET" }),
      addContribution: ({ amount, date, note }) =>
        dispatch({
          type: "CONTRIBUTION_ADD",
          contribution: {
            id: createId(),
            amount,
            date,
            note: note && note.trim().length > 0 ? note.trim() : undefined,
            createdAt: new Date().toISOString(),
          },
        }),
      updateContribution: (id, patch) => dispatch({ type: "CONTRIBUTION_UPDATE", id, patch }),
      deleteContribution: (id) => dispatch({ type: "CONTRIBUTION_DELETE", id }),
      patchFund: (patch) => dispatch({ type: "FUND_PATCH", patch }),
      addWishlistItem: (input) =>
        dispatch({
          type: "WISH_ADD",
          item: {
            ...input,
            id: createId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      updateWishlistItem: (id, patch) => dispatch({ type: "WISH_UPDATE", id, patch }),
      deleteWishlistItem: (id) => dispatch({ type: "WISH_DELETE", id }),
      toggleWishlistFavorite: (id) => {
        const item = state.wishlist.find((entry) => entry.id === id);
        if (!item) return;
        dispatch({ type: "WISH_UPDATE", id, patch: { favorite: !item.favorite } });
      },
      patchPreferences: (patch) => dispatch({ type: "PREFERENCES_PATCH", patch }),
      replaceState: (next) => dispatch({ type: "REPLACE_STATE", state: next }),
      resetDemoData: () => dispatch({ type: "RESET_DEMO" }),
      resetAllData: () => {
        clearAppState();
        dispatch({ type: "RESET_ALL" });
      },
    };
  }, [state, hydrated, recoveryNotice, toasts, showToast, dismissToast]);

  return <AppStateContext.Provider value={store}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateStore {
  const store = useContext(AppStateContext);
  if (!store) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return store;
}
