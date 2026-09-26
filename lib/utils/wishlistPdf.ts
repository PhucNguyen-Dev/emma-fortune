import type { WishlistItem } from "@/types";
import { WISHLIST_CATEGORIES } from "@/types";

/**
 * Builds the printable "list of favourites" PDF: only each treasure's name and
 * famous brand — never any prices, points, or app machinery. This is the list
 * that can travel into the real world.
 */

export type PdfScope = "favourites" | "all";

const NON_LATIN1 = /[^\u0000-\u00FF]/g;

function sanitize(text: string): string {
  return text.replace(NON_LATIN1, "");
}

export function selectItemsForPdf(items: WishlistItem[], scope: PdfScope): WishlistItem[] {
  return scope === "favourites" ? items.filter((item) => item.favorite) : [...items];
}

export function favouritesPdfFilename(recipientName: string): string {
  const base = sanitize(recipientName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "my"}-favourites.pdf`;
}

/** Group items under their curated categories, in a stable, pretty order. */
function groupItems(items: WishlistItem[]): { category: string; items: WishlistItem[] }[] {
  const groups: { category: string; items: WishlistItem[] }[] = [];
  const known = new Set<string>(WISHLIST_CATEGORIES);
  for (const category of WISHLIST_CATEGORIES) {
    const inCategory = items.filter((item) => item.category === category);
    if (inCategory.length > 0) groups.push({ category, items: inCategory });
  }
  const other = items.filter((item) => !known.has(item.category));
  if (other.length > 0) groups.push({ category: "Other dreams", items: other });
  return groups;
}

export type FavouritesPdf = {
  filename: string;
  /** Ready to save or share — contains names and brands only. */
  blob: Blob;
  /** The underlying jsPDF document (loosely typed; it comes from a dynamic import). */
  doc: {
    output: (type: "arraybuffer") => ArrayBuffer;
    getNumberOfPages: () => number;
  };
  /** Page count, for the UI to mention. */
  pages: number;
};

export async function createFavouritesPdf(
  items: WishlistItem[],
  recipientName: string,
): Promise<FavouritesPdf> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 22;
  const safeName = sanitize(recipientName).trim() || "My";

  // Header
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(40, 33, 42);
  doc.text(`${safeName}'s Favourites`, margin, 28);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(120, 108, 117);
  const today = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  doc.text("a little list of lovely things", margin, 35);
  doc.text(today, pageWidth - margin, 35, { align: "right" });

  doc.setDrawColor(214, 183, 121);
  doc.setLineWidth(0.4);
  doc.line(margin, 40, pageWidth - margin, 40);

  // Body
  let y = 52;
  let index = 0;
  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 26;
    }
  };

  for (const group of groupItems(items)) {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(84, 36, 63);
    doc.text(sanitize(group.category).toUpperCase(), margin, y);
    y += 7;

    for (const item of group.items) {
      index += 1;
      const name = sanitize(item.name);
      const brand = sanitize(item.brand ?? "");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(40, 33, 42);
      const label = `${index}. ${name}`;
      doc.text(label, margin + 2, y);

      if (brand) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(168, 84, 110);
        const nameWidth = doc.getTextWidth(label);
        doc.text(`— ${brand}`, margin + 2 + nameWidth + 2, y);
      }
      y += 6.4;
    }
    y += 4;
  }

  if (index === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(120, 108, 117);
    doc.text("Nothing here yet — the list is waiting for its first treasure.", margin, y);
  }

  // Footers
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(160, 148, 155);
    doc.text("made with love", pageWidth / 2, pageHeight - 12, { align: "center" });
    doc.text(`${page} / ${pages}`, pageWidth - margin, pageHeight - 12, { align: "right" });
  }

  return {
    filename: favouritesPdfFilename(recipientName),
    blob: doc.output("blob"),
    doc,
    pages,
  };
}
