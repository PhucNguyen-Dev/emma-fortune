import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import {
  deleteTrackFile,
  getTrackFile,
  isAcceptableTrackFile,
  listUploadedTrackIds,
  saveTrackFile,
} from "@/lib/music/userTracks";
import { TRACKS } from "@/lib/music/tracks";

afterEach(async () => {
  for (const track of TRACKS) {
    await deleteTrackFile(track.id);
  }
  await deleteTrackFile("a");
  await deleteTrackFile("b");
});

describe("the song locker (IndexedDB)", () => {
  it("saves, finds, and removes owner recordings", async () => {
    const id = "track-golden-candles";
    const blob = new Blob(["fake-audio-bytes"], { type: "audio/mpeg" });

    expect(await getTrackFile(id)).toBeNull();

    await saveTrackFile(id, blob);
    const stored = await getTrackFile(id);
    expect(stored).not.toBeNull();
    expect(stored?.size).toBe(blob.size);

    await deleteTrackFile(id);
    expect(await getTrackFile(id)).toBeNull();
  });

  it("reports which of the tracks have recordings", async () => {
    await saveTrackFile("track-layali-al-anwar", new Blob(["x"], { type: "audio/mpeg" }), "layali.mp3");
    const map = await listUploadedTrackIds(TRACKS.map((track) => track.id));
    expect(map["track-layali-al-anwar"]).toBe(true);
    expect(map["track-golden-candles"]).toBe(false);
    await deleteTrackFile("track-layali-al-anwar");
  });

  it("keeps each song independent", async () => {
    await saveTrackFile("a", new Blob(["aaa"]));
    await saveTrackFile("b", new Blob(["bbb"]));
    expect((await getTrackFile("a")) !== null).toBe(true);
    expect((await getTrackFile("b")) !== null).toBe(true);
    await deleteTrackFile("a");
    expect((await getTrackFile("a"))).toBeNull();
    expect((await getTrackFile("b")) !== null).toBe(true);
    await deleteTrackFile("b");
  });
});

describe("isAcceptableTrackFile", () => {
  it("accepts audio files by type or extension", () => {
    expect(
      isAcceptableTrackFile(new File([new Uint8Array(10)], "song.mp3", { type: "audio/mpeg" })).ok,
    ).toBe(true);
    expect(
      isAcceptableTrackFile(new File([new Uint8Array(10)], "song.xyz", { type: "audio/ogg" })).ok,
    ).toBe(true);
    expect(
      isAcceptableTrackFile(new File([new Uint8Array(10)], "song.m4a", { type: "" })).ok,
    ).toBe(true);
  });

  it("rejects non-audio, empty, and oversized files", () => {
    const wrong = isAcceptableTrackFile(new File([new Uint8Array(10)], "photo.png", { type: "image/png" }));
    expect(wrong).toMatchObject({ ok: false });

    const empty = isAcceptableTrackFile(new File([], "song.mp3", { type: "audio/mpeg" }));
    expect(empty).toMatchObject({ ok: false });

    const big = new File([new Uint8Array(26 * 1024 * 1024)], "song.mp3", { type: "audio/mpeg" });
    expect(isAcceptableTrackFile(big)).toMatchObject({ ok: false });
  });
});
