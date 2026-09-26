import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsView } from "@/components/settings/SettingsView";
import { deleteTrackFile, getTrackFile } from "@/lib/music/userTracks";
import { clearStorage, renderWithProviders, seedStorage } from "../helpers";

beforeEach(async () => {
  clearStorage();
  await deleteTrackFile("track-golden-candles");
});

describe("Settings: the songs", () => {
  it("lists the five songs with their built-in status", () => {
    seedStorage();
    renderWithProviders(<SettingsView />);
    expect(screen.getByText(/Khúc Hát Mừng Sinh Nhật/)).toBeInTheDocument();
    expect(screen.getAllByText("built-in melody")).toHaveLength(5);
    expect(screen.queryAllByText("your recording")).toHaveLength(0);
  });

  it("accepts an uploaded recording and uses it for that song only", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<SettingsView />);

    const input = screen.getByLabelText(/Upload a recording for Candles in the Golden Hour/i);
    const file = new File([new Uint8Array(1024)], "candles.mp3", { type: "audio/mpeg" });
    await user.upload(input, file);

    await waitFor(async () => {
      expect(await getTrackFile("track-golden-candles")).not.toBeNull();
      expect(screen.getAllByText("your recording")).toHaveLength(1);
      expect(screen.getAllByText("built-in melody")).toHaveLength(4);
    });
  });

  it("removes a recording and returns the song to its built-in melody", async () => {
    const user = userEvent.setup();
    seedStorage();
    renderWithProviders(<SettingsView />);

    const input = screen.getByLabelText(/Upload a recording for Candles in the Golden Hour/i);
    await user.upload(input, new File([new Uint8Array(512)], "candles.mp3", { type: "audio/mpeg" }));

    await waitFor(async () => {
      expect(screen.getByRole("button", { name: /^Remove$/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /^Remove$/i }));

    await waitFor(async () => {
      expect(await getTrackFile("track-golden-candles")).toBeNull();
      expect(screen.getAllByText("built-in melody")).toHaveLength(5);
    });
  });
});
