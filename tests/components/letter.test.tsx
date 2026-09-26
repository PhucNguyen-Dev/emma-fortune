import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LetterView } from "@/components/letter/LetterView";
import { createDefaultState } from "@/lib/config/defaults";
import { clearStorage, readStoredState, renderWithProviders, seedStorage } from "../helpers";

beforeEach(() => clearStorage());

describe("LetterView", () => {
  it("opens, shows the letter text, and can be read again", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<LetterView />);

    expect(screen.queryByText(/Happy birthday, my love\./i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open the letter" }));

    expect(screen.getByText(/Happy birthday, my love\./i)).toBeInTheDocument();
    expect(screen.getByText(/I love you\./i)).toBeInTheDocument();
    expect(screen.getByText("Forever yours,")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Read it again" }));
    expect(screen.getByRole("button", { name: "Open the letter" })).toBeInTheDocument();
  });

  it("hides the 'Things I love about you' section while empty in recipient view", () => {
    seedStorage({ preferences: { previewMode: "recipient" } });
    renderWithProviders(<LetterView />);
    expect(screen.queryByText(/Things I love about you/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Owner note/i)).not.toBeInTheDocument();
  });

  it("never shows owner notes or placeholders on the letter page, in any view", async () => {
    const user = userEvent.setup();
    seedStorage({ preferences: { previewMode: "owner" } });
    renderWithProviders(<LetterView />);
    await user.click(screen.getByRole("button", { name: "Open the letter" }));
    expect(screen.queryByText(/Owner note/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/hidden from recipients/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ADD MEMORY/i)).not.toBeInTheDocument();
  });

  it("shows filled personal reasons to everyone", async () => {
    const base = createDefaultState();
    window.localStorage.clear();
    seedStorage({
      config: {
        ...base.config,
        letter: {
          salutation: "Hi,",
          body: "Happy birthday, my love.\n\nI love you.",
          signOff: "Yours,",
          personalReasons: ["Your laugh", "Your kindness", "Your ambition"],
        },
      },
      preferences: { previewMode: "recipient" },
    });
    renderWithProviders(<LetterView />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Open the letter" }));
    expect(screen.getByText("Things I love about you")).toBeInTheDocument();
    expect(screen.getByText("Your kindness")).toBeInTheDocument();
  });

  it("persists nothing that could embarrass — letter stays local", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<LetterView />);
    await user.click(screen.getByRole("button", { name: "Open the letter" }));
    await waitFor(() => {
      expect(screen.getByText(/Happy birthday, my love\./i)).toBeInTheDocument();
    });
    const stored = readStoredState();
    expect(stored?.config.letter.body).toContain("I know you love money");
  });
});
