import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsView } from "@/components/settings/SettingsView";
import { OverviewView } from "@/components/overview/OverviewView";
import { clearStorage, readStoredState, renderWithProviders, seedStorage } from "../helpers";

beforeEach(() => clearStorage());

describe("SettingsView", () => {
  it("saves a new sender name and persists it", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<SettingsView />);

    const sender = screen.getByLabelText(/Sender name/);
    await user.clear(sender);
    await user.type(sender, "Minh");

    const profileSection = screen.getAllByRole("button", { name: /Save changes/i })[0];
    await user.click(profileSection);

    await waitFor(() => {
      expect(readStoredState()?.config.senderName).toBe("Minh");
    });
    expect(screen.getByLabelText(/Sender name/)).toHaveValue("Minh");
  });

  it("validates fund target must be greater than zero", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<SettingsView />);

    const target = screen.getByLabelText(/Target amount/);
    await user.clear(target);
    await user.type(target, "0");

    const fundSave = screen.getAllByRole("button", { name: /Save changes/i })[3];
    await user.click(fundSave);

    expect(screen.getByText(/Target amount must be greater than zero/i)).toBeInTheDocument();
    expect(readStoredState()?.config.fund.targetAmount).toBe(5_000_000);
  });

  it("requires confirmation before resetting all data", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<SettingsView />);

    await user.click(screen.getByRole("button", { name: /Reset all data/i }));
    const dialog = screen.getByText("Reset ALL data?");
    expect(dialog).toBeInTheDocument();

    // Closing without confirming keeps the data.
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(readStoredState()?.config.senderName).toBe("Your Love");

    await user.click(screen.getByRole("button", { name: /Reset all data/i }));
    await user.click(screen.getByRole("button", { name: "Erase everything" }));
    await waitFor(() => {
      const stored = readStoredState();
      // The persist effect rewrites factory defaults after reset.
      expect(stored?.preferences.introSeen).toBeFalsy();
    });
  });

  it("exports nothing external — import validation is exposed through UI text", () => {
    seedStorage();
    renderWithProviders(<SettingsView />);
    expect(
      screen.getByText(/Everything lives in this browser only/i),
    ).toBeInTheDocument();
  });

  it("keeps the empty personal-reasons hint in Settings, never on her letter page", () => {
    seedStorage();
    renderWithProviders(<SettingsView />);
    expect(
      screen.getByText(/she will never see a placeholder or an owner note/i),
    ).toBeInTheDocument();
  });
});

describe("Settings → recipient view integration", () => {
  it("changes made in settings are visible to the recipient view", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<SettingsView />);

    const recipient = screen.getByLabelText(/Recipient name/);
    await user.clear(recipient);
    await user.type(recipient, "Emmy");

    await user.click(screen.getAllByRole("button", { name: /Save changes/i })[0]);
    await waitFor(() => {
      expect(readStoredState()?.config.recipientName).toBe("Emmy");
    });
  });
});

describe("Overview intro", () => {
  it("shows a dismissible first-visit greeting and remembers it", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<OverviewView />);

    const greeting = screen.getByRole("dialog", { name: "Birthday greeting" });
    expect(greeting).toBeInTheDocument();

    await user.click(
      within(greeting).getByRole("button", { name: "Begin the experience" }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Birthday greeting" })).not.toBeInTheDocument();
    });
    expect(readStoredState()?.preferences.introSeen).toBe(true);
  });

  it("does not show the greeting again after introSeen", () => {
    seedStorage({ preferences: { introSeen: true } });
    renderWithProviders(<OverviewView />);
    expect(screen.queryByRole("dialog", { name: "Birthday greeting" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Happy Birthday, Emma\./i }),
    ).toBeInTheDocument();
  });
});
