import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FundView } from "@/components/fund/FundView";
import { clearStorage, readStoredState, renderWithProviders, seedStorage } from "../helpers";

beforeEach(() => clearStorage());

describe("FundView", () => {
  it("starts at zero with the demo-target label and honest empty state", () => {
    seedStorage();
    renderWithProviders(<FundView />);
    expect(screen.getByTestId("fund-saved")).toHaveTextContent(/0/);
    expect(screen.queryByText(/demo target/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Every real journey starts with the first real contribution/i),
    ).toBeInTheDocument();
  });

  it("rejects zero, negative, and non-numeric amounts inline", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<FundView />);

    const amount = screen.getByLabelText(/Amount/);

    await user.type(amount, "0");
    await user.click(screen.getByRole("button", { name: /Add contribution/i }));
    expect(screen.getByText(/must be greater than zero/i)).toBeInTheDocument();

    await user.clear(amount);
    await user.type(amount, "-5");
    await user.click(screen.getByRole("button", { name: /Add contribution/i }));
    expect(screen.getByText(/must be greater than zero/i)).toBeInTheDocument();

    await user.clear(amount);
    await user.type(amount, "abc");
    await user.click(screen.getByRole("button", { name: /Add contribution/i }));
    expect(screen.getByText(/Enter a valid number/i)).toBeInTheDocument();

    const stored = readStoredState();
    expect(stored?.contributions).toHaveLength(0);
  });

  it("adds a contribution and updates total, progress, and list", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<FundView />);

    await user.type(screen.getByLabelText(/Amount/), "1000000");
    await user.click(screen.getByRole("button", { name: /Add contribution/i }));

    await waitFor(() => {
      expect(screen.getByText("Contributions (1)")).toBeInTheDocument();
    });
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(readStoredState()?.contributions).toHaveLength(1);
  });

  it("sends coins from the fund to the Birthday Bank when she asks", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<FundView />);

    await user.type(screen.getByLabelText(/Amount/), "200000");
    await user.click(screen.getByRole("button", { name: /Add contribution/i }));
    await waitFor(() => expect(screen.getByText("Contributions (1)")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Send coins to my Birthday Bank/i }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(/How many coins?/i), "50000");
    await user.click(within(dialog).getByRole("button", { name: /Fly to the bank/i }));

    await waitFor(() => {
      const stored = readStoredState();
      expect(stored?.transactions).toHaveLength(1);
      expect(stored?.transactions[0].kind).toBe("transfer");
      expect(stored?.transactions[0].direction).toBe("in");
    });
    expect(
      screen.getByText(/Coins now living in your Birthday Bank/i),
    ).toBeInTheDocument();
  });

  it("deletes a contribution only after confirmation and recalculates", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<FundView />);

    await user.type(screen.getByLabelText(/Amount/), "500000");
    await user.click(screen.getByRole("button", { name: /Add contribution/i }));
    await waitFor(() => expect(screen.getByText("Contributions (1)")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Delete contribution of/i }));
    expect(screen.getByText("Delete this contribution?")).toBeInTheDocument();

    // Cancel keeps it.
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Contributions (1)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Delete contribution of/i }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => {
      expect(screen.getByText(/Nothing recorded yet/i)).toBeInTheDocument();
    });
    expect(readStoredState()?.contributions).toHaveLength(0);
  });

  it("offers 'mark as reached' only when contributions meet the target", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<FundView />);

    expect(
      screen.queryByRole("button", { name: /This dream came true/i }),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/Amount/), "5000000");
    await user.click(screen.getByRole("button", { name: /Add contribution/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /This dream came true/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /This dream came true/i }));
    await user.click(screen.getByRole("button", { name: "Yes, we made it" }));
    await waitFor(() => {
      expect(screen.getByText(/Dream in bloom/i)).toBeInTheDocument();
    });
    expect(readStoredState()?.preferences.fundGoalReached).toBe(true);
  });
});
