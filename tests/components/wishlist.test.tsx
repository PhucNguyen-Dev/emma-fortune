import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { clearStorage, readStoredState, renderWithProviders, seedStorage } from "../helpers";

beforeEach(() => clearStorage());

describe("WishlistView", () => {
  it("renders the default catalog with summary counts", () => {
    seedStorage();
    renderWithProviders(<WishlistView />);
    expect(screen.getByText("Elegant everyday handbag")).toBeInTheDocument();
    expect(screen.getByText("Total wishes")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("adds a wish with validation feedback", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<WishlistView />);

    await user.click(screen.getByRole("button", { name: /Add to wishlist/i }));
    const dialog = screen.getByRole("dialog");

    // Submitting an empty form is rejected inline.
    await user.click(within(dialog).getByRole("button", { name: "Add wish" }));
    expect(within(dialog).getByText("Give this wish a name.")).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText("Name"), "Vintage vinyl player");
    await user.click(within(dialog).getByRole("button", { name: "Add wish" }));

    await waitFor(() => {
      expect(screen.getByText("Vintage vinyl player")).toBeInTheDocument();
    });
    expect(readStoredState()?.wishlist.some((w) => w.name === "Vintage vinyl player")).toBe(true);
  });

  it("favorites a wish and filters to favorites", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<WishlistView />);

    await user.click(
      screen.getByRole("button", { name: /Add Signature perfume to favorites/i }),
    );

    const favoritesToggle = screen.getByRole("button", { name: "Favorites" });
    await user.click(favoritesToggle);

    const grid = screen.getByRole("region", { name: "Wish cards" });
    expect(within(grid).getByText("Signature perfume")).toBeInTheDocument();
    expect(within(grid).queryByText("A spa day")).not.toBeInTheDocument();
  });

  it("searches and shows the filtered empty state with a clear action", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<WishlistView />);

    await user.type(screen.getByLabelText("Search wishes"), "handbag");
    const grid = screen.getByRole("region", { name: "Wish cards" });
    expect(within(grid).getByText("Elegant everyday handbag")).toBeInTheDocument();
    expect(within(grid).queryByText("A spa day")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Search wishes"));
    await user.type(screen.getByLabelText("Search wishes"), "zzzzz");
    expect(screen.getByText("No wishes match")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Clear filters/i }));
    expect(within(screen.getByRole("region", { name: "Wish cards" })).getByText("A spa day")).toBeInTheDocument();
  });

  it("edits status to gifted from the detail dialog", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<WishlistView />);

    await user.click(screen.getByRole("button", { name: /Open details for A spa day/i }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "gifted" }));

    await waitFor(() => {
      expect(readStoredState()?.wishlist.find((w) => w.name === "A spa day")?.status).toBe("gifted");
    });
  });

  it("deletes a wish after confirmation", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<WishlistView />);

    await user.click(screen.getByRole("button", { name: /Open details for A spa day/i }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.queryByText("A spa day")).not.toBeInTheDocument();
    });
    expect(readStoredState()?.wishlist).toHaveLength(7);
  });

  it("welcomes an empty wishlist with an add CTA", () => {
    window.localStorage.clear();
    seedStorage({ wishlist: [] });
    renderWithProviders(<WishlistView />);
    expect(screen.getByText("Your collection awaits")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add wish" })).toBeInTheDocument();
  });
});
