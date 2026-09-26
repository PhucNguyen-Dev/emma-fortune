"use client";

import { useMemo, useState } from "react";
import { Download, Gift, Heart, Search, Sparkles, Star, X } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { WishCard } from "@/components/wishlist/WishCard";
import { WishDetailDialog } from "@/components/wishlist/WishDetailDialog";
import {
  WishFormDialog,
  emptyWishForm,
  type WishFormValues,
} from "@/components/wishlist/WishFormDialog";
import { useAppState } from "@/lib/state/AppStateContext";
import {
  defaultWishlistFilters,
  filterAndSortWishlist,
  wishlistSummary,
  type WishlistFilters,
} from "@/lib/utils/wishlist";
import {
  createFavouritesPdf,
  selectItemsForPdf,
} from "@/lib/utils/wishlistPdf";
import { WISHLIST_CATEGORIES, type WishlistItem } from "@/types";

export function WishlistView() {
  const { state, addWishlistItem, updateWishlistItem, deleteWishlistItem, toggleWishlistFavorite, showToast } =
    useAppState();
  const [filters, setFilters] = useState<WishlistFilters>(defaultWishlistFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WishlistItem | null>(null);
  const [detail, setDetail] = useState<WishlistItem | null>(null);
  const [deleting, setDeleting] = useState<WishlistItem | null>(null);

  const items = state.wishlist;
  const summary = wishlistSummary(items);
  const visible = useMemo(() => filterAndSortWishlist(items, filters), [items, filters]);
  const filtersActive =
    filters.query.trim() !== "" ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.favoritesOnly;

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: WishlistItem) {
    setDetail(null);
    setEditing(item);
    setFormOpen(true);
  }

  function submitForm(values: WishFormValues) {
    const price =
      values.estimatedPrice.trim().length > 0
        ? Number(values.estimatedPrice.replace(/,/g, "."))
        : undefined;
    const payload = {
      name: values.name.trim(),
      brand: values.brand.trim() || undefined,
      category: values.category,
      description: values.description.trim(),
      estimatedPrice: price !== undefined && Number.isFinite(price) ? price : undefined,
      currency: values.currency.trim() || undefined,
      priority: values.priority,
      status: values.status,
      favorite: values.favorite,
      imageUrl: values.imageUrl.trim() || undefined,
    };
    if (editing) {
      updateWishlistItem(editing.id, payload);
      showToast(`“${payload.name}” updated.`);
    } else {
      addWishlistItem(payload);
      showToast(`“${payload.name}” added to your collection. ✨`);
    }
  }

  const [printOpen, setPrintOpen] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);

  const favouriteCount = items.filter((item) => item.favorite).length;

  async function downloadPdf(scope: "favourites" | "all") {
    setPrintBusy(true);
    try {
      const chosen = selectItemsForPdf(items, scope);
      const pdf = await createFavouritesPdf(chosen, state.config.recipientName);
      const url = URL.createObjectURL(pdf.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = pdf.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      showToast("Your little list is ready — names and brands only. 📜");
      setPrintOpen(false);
    } finally {
      setPrintBusy(false);
    }
  }

  const formInitial: WishFormValues = editing
    ? {
        name: editing.name,
        brand: editing.brand ?? "",
        category: editing.category,
        description: editing.description,
        estimatedPrice:
          typeof editing.estimatedPrice === "number" ? String(editing.estimatedPrice) : "",
        currency: editing.currency ?? "",
        priority: editing.priority,
        status: editing.status,
        favorite: editing.favorite,
        imageUrl: editing.imageUrl ?? "",
      }
    : emptyWishForm;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Curated · No checkout"
        title="The Rich Girl Collection"
        subtitle="For the things you love, the things you dream about, and the things we might plan together."
        badge={<Badge tone="blush">Dreams & ideas · No checkout</Badge>}
        actions={
          <>
            <Button variant="secondary" onClick={() => setPrintOpen(true)}>
              <Download className="h-4 w-4" aria-hidden />
              Print my favourites
            </Button>
            <Button onClick={openAdd}>
              <Sparkles className="h-4 w-4" aria-hidden />
              Add to wishlist
            </Button>
          </>
        }
      />

      <section aria-label="Wishlist summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total wishes", value: summary.total, icon: Gift },
          { label: "Favorites", value: summary.favorites, icon: Heart },
          { label: "Planned", value: summary.planned, icon: Star },
          { label: "Gifted", value: summary.gifted, icon: Sparkles },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-plum/10 bg-white/70 px-4 py-3"
            >
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {stat.label}
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-plum">{stat.value}</p>
            </div>
          );
        })}
      </section>

      {items.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Your collection awaits"
          body="Nothing here yet — add the first thing you'd love to have, someday, maybe."
          action={
            <Button onClick={openAdd}>
              <Sparkles className="h-4 w-4" aria-hidden />
              Add wish
            </Button>
          }
        />
      ) : (
        <>
          <section aria-label="Search and filters">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <Input
                  type="search"
                  aria-label="Search wishes"
                  placeholder="Search wishes…"
                  className="pl-9"
                  value={filters.query}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, query: event.target.value }))
                  }
                />
              </div>
              <Select
                aria-label="Filter by category"
                value={filters.category}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, category: event.target.value }))
                }
              >
                <option value="all">All categories</option>
                {WISHLIST_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="Filter by status"
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value as WishlistFilters["status"],
                  }))
                }
              >
                <option value="all">All statuses</option>
                <option value="dreaming">Dreaming</option>
                <option value="planned">Planned</option>
                <option value="gifted">Gifted</option>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  aria-label="Sort wishes"
                  value={filters.sort}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      sort: event.target.value as WishlistFilters["sort"],
                    }))
                  }
                >
                  <option value="newest">Newest</option>
                  <option value="priority">Priority</option>
                  <option value="price-desc">Price: high → low</option>
                  <option value="price-asc">Price: low → high</option>
                </Select>
                <Button
                  variant={filters.favoritesOnly ? "champagne" : "secondary"}
                  aria-pressed={filters.favoritesOnly}
                  onClick={() =>
                    setFilters((current) => ({ ...current, favoritesOnly: !current.favoritesOnly }))
                  }
                >
                  <Heart
                    className="h-4 w-4"
                    aria-hidden
                    fill={filters.favoritesOnly ? "currentColor" : "none"}
                  />
                  Favorites
                </Button>
              </div>
            </div>
          </section>

          {visible.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No wishes match"
              body="Try different filters, or clear them to see the whole collection."
              action={
                filtersActive ? (
                  <Button variant="secondary" onClick={() => setFilters(defaultWishlistFilters)}>
                    <X className="h-4 w-4" aria-hidden />
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <section
              aria-label="Wish cards"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visible.map((item) => (
                <WishCard
                  key={item.id}
                  item={item}
                  onOpen={setDetail}
                  onToggleFavorite={toggleWishlistFavorite}
                />
              ))}
            </section>
          )}
        </>
      )}

      <WishFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={formInitial}
        onSubmit={submitForm}
      />

      <WishDetailDialog
        item={detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
        onEdit={openEdit}
        onDelete={(item) => {
          setDetail(null);
          setDeleting(item);
        }}
      />

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent>
          <DialogTitle>A little list for the real world</DialogTitle>
          <DialogDescription>
            Only each treasure&apos;s name and famous brand — no points, no prices, nothing
            from our world. Save it as a PDF or print it and dream out loud.
          </DialogDescription>
          <div className="mt-5 flex flex-col gap-2">
            <Button
              onClick={() => void downloadPdf("favourites")}
              disabled={printBusy || favouriteCount === 0}
            >
              <Heart className="h-4 w-4" aria-hidden />
              My favourites ({favouriteCount})
            </Button>
            <Button variant="secondary" onClick={() => void downloadPdf("all")} disabled={printBusy}>
              <Gift className="h-4 w-4" aria-hidden />
              Everything ({items.length})
            </Button>
            {favouriteCount === 0 && (
              <p className="text-xs text-muted">
                Tap the heart on a wish to add it to your favourites.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPrintOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this wish?"
        body={deleting ? `“${deleting.name}” will be removed from your collection.` : ""}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (!deleting) return;
          deleteWishlistItem(deleting.id);
          showToast("Wish deleted.", "info");
        }}
      />
    </div>
  );
}
