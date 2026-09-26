import { describe, expect, it } from "vitest";
import {
  getTrack,
  midiToFreq,
  nextTrackId,
  randomTrackId,
  TRACKS,
  trackFileCandidates,
} from "@/lib/music/tracks";

describe("the five tracks", () => {
  it("covers five cultures with unique ids and titles", () => {
    expect(TRACKS).toHaveLength(5);
    const origins = TRACKS.map((track) => track.origin);
    expect(origins.some((origin) => origin.includes("English"))).toBe(true);
    expect(origins.some((origin) => origin.includes("Arabic"))).toBe(true);
    expect(origins.some((origin) => origin.includes("Chinese"))).toBe(true);
    expect(origins.some((origin) => origin.includes("Vietnamese"))).toBe(true);
    expect(origins.some((origin) => origin.includes("Middle East"))).toBe(true);
    expect(new Set(TRACKS.map((track) => track.id)).size).toBe(5);
    expect(new Set(TRACKS.map((track) => track.title)).size).toBe(5);
  });

  it("keeps every note inside its loop and in a singable register", () => {
    for (const track of TRACKS) {
      for (const note of [...track.melody, ...track.pad]) {
        expect(note.start).toBeGreaterThanOrEqual(0);
        expect(note.start + note.dur).toBeLessThanOrEqual(track.loopBeats);
        expect(note.midi).toBeGreaterThanOrEqual(36);
        expect(note.midi).toBeLessThanOrEqual(96);
      }
      expect(track.melody.length).toBeGreaterThan(8);
      expect(track.bpm).toBeGreaterThan(40);
      expect(track.bpm).toBeLessThan(140);
    }
  });

  it("uses a different timbre for every corner of the world", () => {
    expect(new Set(TRACKS.map((track) => track.timbre)).size).toBe(5);
  });
});

describe("helpers", () => {
  it("converts midi to frequency (A4 = 440)", () => {
    expect(midiToFreq(69)).toBeCloseTo(440);
    expect(midiToFreq(60)).toBeCloseTo(261.6, 1);
  });

  it("finds tracks, cycles them, and rolls random ids", () => {
    expect(getTrack("track-golden-candles")?.title).toContain("Candles");
    expect(getTrack("nope")).toBeUndefined();

    const first = TRACKS[0].id;
    expect(nextTrackId(first, 1)).toBe(TRACKS[1].id);
    // wraps around the list
    const last = TRACKS[TRACKS.length - 1].id;
    expect(nextTrackId(last, 1)).toBe(TRACKS[0].id);
    expect(nextTrackId(first, -1)).toBe(last);

    const random = randomTrackId();
    expect(getTrack(random)).toBeDefined();
  });

  it("names the owner-supplied recording candidates per track", () => {
    expect(trackFileCandidates("track-golden-candles")).toEqual([
      "/music/track-golden-candles.mp3",
      "/music/track-golden-candles.m4a",
      "/music/track-golden-candles.ogg",
    ]);
  });
});
