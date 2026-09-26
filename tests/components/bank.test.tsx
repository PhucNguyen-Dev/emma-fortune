import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BankView } from "@/components/bank/BankView";
import { clearStorage, renderWithProviders, seedStorage, readStoredState } from "../helpers";

beforeEach(() => clearStorage());

describe("BankView", () => {
  it("shows the treasury with romantic, fantasy wording", () => {
    seedStorage();
    renderWithProviders(<BankView />);
    expect(screen.getByTestId("love-balance")).toHaveTextContent(/1\.000\.000|1,000,000/);
    expect(screen.getAllByText(/Coins minted from love/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/minted from a moment with you/i)).toBeInTheDocument();
    expect(screen.queryByText(/no cash value/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/not real currency/i)).not.toBeInTheDocument();
  });

  it("shows the boutique with the magical teaser and the sleeping treasure", () => {
    seedStorage();
    renderWithProviders(<BankView />);
    expect(screen.getByText(/something magical will appear before you/i)).toBeInTheDocument();
    expect(screen.getByText(/Something rare sleeps here/i)).toBeInTheDocument();
    expect(screen.getAllByText(/treasures/i).length).toBeGreaterThan(0);
  });

  it("buys a boutique treasure: balance drops and the story records it", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<BankView />);

    const before = readStoredState();
    expect(before?.transactions).toHaveLength(0);

    const buyButton = screen.getAllByRole("button", { name: /^Buy .+ love points$/i })[0];
    await user.click(buyButton);

    await waitFor(() => {
      const stored = readStoredState();
      expect(stored?.transactions).toHaveLength(1);
      expect(stored?.transactions[0].kind).toBe("purchase");
    });
    const after = readStoredState();
    const price = after?.transactions[0].fictionalPointCost ?? 0;
    expect(price).toBeGreaterThanOrEqual(1000);
    expect(price).toBeLessThanOrEqual(100000);

    // Every purchase also lands in her wishlist, brand attached.
    const wish = after?.wishlist.find((w) => w.shopItemId === after.transactions[0].couponId);
    expect(wish).toBeDefined();
    expect(wish?.brand).toBeTruthy();
    expect(wish?.favorite).toBe(false);
  });

  it("wakes the rare treasure when the odds say so", async () => {
    const user = userEvent.setup();
    const state = seedStorage();
    state.config.specialCard.ratePercent = 100;
    window.localStorage.clear();
    seedStorage({ config: state.config });

    renderWithProviders(<BankView />);
    expect(screen.getByText(/A treasure beyond price/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /^Buy .+ love points$/i })[0]);

    await waitFor(() => {
      expect(readStoredState()?.specialCard.found).toBe(true);
    });
    expect(screen.getByText(/It woke up for you\. Tap to open it\./i)).toBeInTheDocument();
  });

  it("sends coins home to the Future Fund from the bank", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<BankView />);

    await user.click(screen.getByRole("button", { name: /Send coins to my Future Fund/i }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(/How many coins\?/i), "5000");
    await user.click(within(dialog).getByRole("button", { name: /Fly home/i }));

    await waitFor(() => {
      const stored = readStoredState();
      expect(stored?.transactions).toHaveLength(1);
      expect(stored?.transactions[0].kind).toBe("transfer");
      expect(stored?.transactions[0].direction).toBe("out");
    });
    expect(screen.getByTestId("love-balance")).toHaveTextContent(/995\.000|995,000/);
  });

  it("redeems a coupon after confirmation and records activity", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<BankView />);

    await user.click(screen.getByRole("button", { name: /Redeem coupon: One long hug/i }));
    expect(screen.getByText("Redeem this little promise?")).toBeInTheDocument();

    // Cancel first — the coupon must stay available.
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.getByRole("button", { name: /Redeem coupon: One long hug/i }),
    ).toBeInTheDocument();

    // Confirm — moves to Redeemed and creates exactly one transaction.
    await user.click(screen.getByRole("button", { name: /Redeem coupon: One long hug/i }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(screen.getByText("Redeemed (1)")).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/Your first little adventure will show up here\./i),
    ).not.toBeInTheDocument();

    const stored = readStoredState();
    expect(stored?.transactions).toHaveLength(1);
    expect(stored?.transactions[0].couponTitle).toBe("One long hug");
    expect(stored?.coupons.find((c) => c.id === "coupon-long-hug")?.status).toBe("redeemed");
  });

  it("prevents duplicate redemption (redeemed coupons are not redeemable)", async () => {
    const user = userEvent.setup();
    const state = seedStorage();
    state.coupons = state.coupons.map((c) =>
      c.id === "coupon-long-hug"
        ? { ...c, status: "redeemed", redeemedAt: new Date().toISOString() }
        : c,
    );
    window.localStorage.clear();
    seedStorage({ coupons: state.coupons, transactions: [
      { id: "t1", couponId: "coupon-long-hug", couponTitle: "One long hug", fictionalPointCost: 5000, createdAt: new Date().toISOString() },
    ] });

    renderWithProviders(<BankView />);
    expect(screen.getByText("Redeemed (1)")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Redeem coupon: One long hug/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Redeem coupon: A date picked by you/i })).toBeInTheDocument();

    // Silence unused-var lint in strict environments.
    void user;
  });

  it("shows a friendly empty state when all coupons are redeemed", async () => {
    const user = userEvent.setup();
    const state = seedStorage();
    const coupons = state.coupons.map((c) => ({ ...c, status: "redeemed" as const }));
    const transactions = coupons.map((c, i) => ({
      id: `t${i}`,
      couponId: c.id,
      couponTitle: c.title,
      fictionalPointCost: c.fictionalPointCost,
      createdAt: new Date().toISOString(),
    }));
    window.localStorage.clear();
    seedStorage({ coupons, transactions });

    renderWithProviders(<BankView />);
    expect(screen.getByText(/You've gathered every promise/i)).toBeInTheDocument();

    void user;
  });

  it("renders a feed entry after redemption with device-only note", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<BankView />);

    await user.click(screen.getByRole("button", { name: /Redeem coupon: One long hug/i }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    const feed = screen.getByRole("region", { name: "Activity feed" });
    await waitFor(() => {
      expect(within(feed).getByText("One long hug")).toBeInTheDocument();
    });
    expect(within(feed).getByText(/on this device only/i)).toBeInTheDocument();
  });
});
