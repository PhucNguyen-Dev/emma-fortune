import { beforeEach, describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MusicPlayer } from "@/components/app-shell/MusicPlayer";
import { clearStorage, renderWithProviders, seedStorage } from "../helpers";

beforeEach(() => clearStorage());

describe("MusicPlayer (the hidden music box)", () => {
  it("waits quietly until she opens it", () => {
    seedStorage();
    renderWithProviders(<MusicPlayer />);
    const button = screen.getByRole("button", { name: /hidden little music box/i });
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: /hidden music box/i })).not.toBeInTheDocument();
  });

  it("opens to reveal five songs from around the world", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<MusicPlayer />);

    await user.click(screen.getByRole("button", { name: /hidden little music box/i }));
    const panel = screen.getByRole("dialog", { name: /hidden music box/i });
    expect(panel).toBeInTheDocument();

    for (const title of [
      "Candles in the Golden Hour",
      "Layali al-Anwar",
      "Moonlit Peonies",
      "Khúc Hát Mừng Sinh Nhật",
      "Caravan of Stars",
    ]) {
      expect(within(panel).getByText(title)).toBeInTheDocument();
    }
  });

  it("never crashes when audio is unavailable (like in tests)", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<MusicPlayer />);

    await user.click(screen.getByRole("button", { name: /hidden little music box/i }));
    const panel = screen.getByRole("dialog", { name: /hidden music box/i });
    await user.click(within(panel).getByText("Moonlit Peonies"));

    // jsdom has no Web Audio, so playback reports failure gracefully —
    // the panel stays open and nothing explodes.
    expect(screen.getByRole("dialog", { name: /hidden music box/i })).toBeInTheDocument();
  });

  it("stays quiet on setup when she has music disabled", () => {
    seedStorage({ preferences: { musicEnabled: false, musicTrackId: "track-layali-al-anwar" } });
    renderWithProviders(<MusicPlayer />);
    expect(screen.getByRole("button", { name: /hidden little music box/i })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: /hidden music box/i })).not.toBeInTheDocument();
  });
});
