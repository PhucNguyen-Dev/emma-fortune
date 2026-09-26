/**
 * The hidden music box — five little pieces, one per corner of her world.
 *
 * Everything is synthesized live in the browser (Web Audio), so nothing is
 * downloaded, stored, or licensed: the birthday melody is public domain, and
 * the Arabic / Chinese / Vietnamese / ancient-Middle-Eastern pieces are
 * original compositions written in each tradition's scales and timbres.
 * Tracks are short loops meant to hum underneath the evening, not replace it.
 *
 * If the owner later drops a recording they own into `public/music/` using the
 * track id as the filename (e.g. `track-layali-al-anwar.mp3`), the engine
 * prefers that file over the synthesized version.
 */

export type Timbre = "music-box" | "ud" | "guzheng" | "dan-tranh" | "ney" | "piano";

export type NoteEvent = {
  /** MIDI note number (C4 = 60). */
  midi: number;
  /** Start within the loop, in beats. */
  start: number;
  /** Length in beats. */
  dur: number;
  /** 0..1 — defaults to a gentle level. */
  vel?: number;
};

export type DrumHit = { start: number; kind: "dum" | "tak" };

export type Track = {
  id: string;
  title: string;
  origin: string;
  hint: string;
  timbre: Timbre;
  bpm: number;
  loopBeats: number;
  melody: NoteEvent[];
  /** Slow sustained tones beneath the melody. */
  pad: NoteEvent[];
  drum?: DrumHit[];
};

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// A few handy pitches — C4 is 60.
const C4 = 60, D4 = 62, Eb4 = 63, E4 = 64, F4 = 65, Fs4 = 66, G4 = 67, A4 = 69, Bb4 = 70, B4 = 71;
const C5 = 72, D5 = 74, E5 = 76, F5 = 77, G5 = 79;
const C3 = 48, F3 = 53, G3 = 55, A2 = 45, A3 = 57, D3 = 50;

/** The public-domain "Happy Birthday" melody, in 3/4. */
const HAPPY_BIRTHDAY: NoteEvent[] = [
  { midi: G4, start: 0, dur: 0.5 },
  { midi: G4, start: 0.5, dur: 0.5 },
  { midi: A4, start: 1, dur: 1 },
  { midi: G4, start: 2, dur: 1 },
  { midi: C5, start: 3, dur: 1 },
  { midi: B4, start: 4, dur: 2 },
  { midi: G4, start: 6, dur: 0.5 },
  { midi: G4, start: 6.5, dur: 0.5 },
  { midi: A4, start: 7, dur: 1 },
  { midi: G4, start: 8, dur: 1 },
  { midi: D5, start: 9, dur: 1 },
  { midi: C5, start: 10, dur: 2 },
  { midi: G4, start: 12, dur: 0.5 },
  { midi: G4, start: 12.5, dur: 0.5 },
  { midi: G5, start: 13, dur: 1 },
  { midi: E5, start: 14, dur: 1 },
  { midi: C5, start: 15, dur: 1 },
  { midi: B4, start: 16, dur: 2 },
  { midi: F5, start: 18, dur: 0.5 },
  { midi: F5, start: 18.5, dur: 0.5 },
  { midi: E5, start: 19, dur: 1 },
  { midi: C5, start: 20, dur: 1 },
  { midi: D5, start: 21, dur: 1 },
  { midi: C5, start: 22, dur: 3 },
];

export const TRACKS: Track[] = [
  {
    id: "track-golden-candles",
    title: "Candles in the Golden Hour",
    origin: "English classic",
    hint: "the melody everyone knows, played like a music box",
    timbre: "music-box",
    bpm: 90,
    loopBeats: 25,
    melody: HAPPY_BIRTHDAY,
    pad: [
      { midi: C3, start: 0, dur: 3 },
      { midi: C3, start: 3, dur: 3 },
      { midi: C3, start: 6, dur: 3 },
      { midi: G3, start: 9, dur: 3 },
      { midi: G3, start: 12, dur: 3 },
      { midi: C3, start: 15, dur: 3 },
      { midi: F3, start: 18, dur: 3 },
      { midi: C3, start: 21, dur: 4 },
    ],
  },
  {
    id: "track-layali-al-anwar",
    title: "Layali al-Anwar",
    origin: "Arabic maqam",
    hint: "nights of lanterns, plucked on strings of amber",
    timbre: "ud",
    bpm: 84,
    loopBeats: 27,
    melody: [
      { midi: D4, start: 0, dur: 1 },
      { midi: Eb4, start: 1, dur: 1 },
      { midi: Fs4, start: 2, dur: 1.5 },
      { midi: G4, start: 3.5, dur: 0.5 },
      { midi: A4, start: 4, dur: 2 },
      { midi: Bb4, start: 6, dur: 1 },
      { midi: A4, start: 7, dur: 1 },
      { midi: G4, start: 8, dur: 1.5 },
      { midi: Fs4, start: 9.5, dur: 0.5 },
      { midi: Eb4, start: 10, dur: 1 },
      { midi: D4, start: 11, dur: 2 },
      { midi: A4, start: 13, dur: 1 },
      { midi: Bb4, start: 14, dur: 1 },
      { midi: C5, start: 15, dur: 1.5 },
      { midi: D5, start: 16.5, dur: 0.5 },
      { midi: C5, start: 17, dur: 1 },
      { midi: Bb4, start: 18, dur: 1 },
      { midi: A4, start: 19, dur: 2 },
      { midi: G4, start: 21, dur: 1 },
      { midi: Fs4, start: 22, dur: 1 },
      { midi: Eb4, start: 23, dur: 1 },
      { midi: D4, start: 24, dur: 3 },
    ],
    pad: [
      { midi: D3, start: 0, dur: 8 },
      { midi: D3, start: 8, dur: 8 },
      { midi: A3, start: 16, dur: 4 },
      { midi: D3, start: 20, dur: 7 },
    ],
    drum: [0, 4, 8, 12, 16, 20, 24].flatMap((beat) => [
      { start: beat, kind: "dum" as const },
      { start: beat + 1, kind: "tak" as const },
      { start: beat + 2, kind: "tak" as const },
    ]),
  },
  {
    id: "track-moonlit-peonies",
    title: "Moonlit Peonies",
    origin: "Chinese guzheng",
    hint: "silver strings under a peony moon",
    timbre: "guzheng",
    bpm: 76,
    loopBeats: 28,
    melody: [
      { midi: C5, start: 0, dur: 1.5 },
      { midi: A4, start: 1.5, dur: 0.5 },
      { midi: G4, start: 2, dur: 1 },
      { midi: E4, start: 3, dur: 1 },
      { midi: G4, start: 4, dur: 1 },
      { midi: A4, start: 5, dur: 2 },
      { midi: C5, start: 7, dur: 1 },
      { midi: D5, start: 8, dur: 1 },
      { midi: E5, start: 9, dur: 2 },
      { midi: D5, start: 11, dur: 1 },
      { midi: C5, start: 12, dur: 1 },
      { midi: A4, start: 13, dur: 2 },
      { midi: G4, start: 15, dur: 1 },
      { midi: A4, start: 16, dur: 1 },
      { midi: C5, start: 17, dur: 1.5 },
      { midi: D5, start: 18.5, dur: 0.5 },
      { midi: E5, start: 19, dur: 2 },
      { midi: G5, start: 21, dur: 2 },
      { midi: E5, start: 23, dur: 1 },
      { midi: D5, start: 24, dur: 1 },
      { midi: C5, start: 25, dur: 3 },
    ],
    pad: [
      { midi: C3, start: 0, dur: 6 },
      { midi: A2, start: 6, dur: 6 },
      { midi: C3, start: 12, dur: 6 },
      { midi: G3, start: 18, dur: 4 },
      { midi: C3, start: 22, dur: 6 },
    ],
  },
  {
    id: "track-khuc-hat-mung-sinh-nhat",
    title: "Khúc Hát Mừng Sinh Nhật",
    origin: "Vietnamese birthday song",
    hint: "the one she knows by heart — warm, shining, close",
    timbre: "piano",
    bpm: 74,
    loopBeats: 32,
    melody: [
      { midi: E4, start: 0, dur: 0.5 },
      { midi: G4, start: 0.5, dur: 0.5 },
      { midi: A4, start: 1, dur: 1 },
      { midi: C5, start: 2, dur: 1.5 },
      { midi: B4, start: 3.5, dur: 0.5 },
      { midi: A4, start: 4, dur: 1 },
      { midi: G4, start: 5, dur: 1 },
      { midi: E4, start: 6, dur: 2 },
      { midi: D4, start: 8, dur: 0.5 },
      { midi: E4, start: 8.5, dur: 0.5 },
      { midi: G4, start: 9, dur: 1 },
      { midi: A4, start: 10, dur: 1.5 },
      { midi: G4, start: 11.5, dur: 0.5 },
      { midi: E4, start: 12, dur: 1 },
      { midi: D4, start: 13, dur: 1 },
      { midi: C4, start: 14, dur: 2 },
      { midi: E4, start: 16, dur: 0.5 },
      { midi: G4, start: 16.5, dur: 0.5 },
      { midi: A4, start: 17, dur: 1 },
      { midi: C5, start: 18, dur: 1.5 },
      { midi: D5, start: 19.5, dur: 0.5 },
      { midi: E5, start: 20, dur: 1 },
      { midi: D5, start: 21, dur: 1 },
      { midi: C5, start: 22, dur: 2 },
      { midi: A4, start: 24, dur: 0.5 },
      { midi: G4, start: 24.5, dur: 0.5 },
      { midi: A4, start: 25, dur: 1 },
      { midi: C5, start: 26, dur: 1.5 },
      { midi: B4, start: 27.5, dur: 0.5 },
      { midi: A4, start: 28, dur: 1 },
      { midi: G4, start: 29, dur: 1 },
      { midi: C5, start: 30, dur: 2 },
    ],
    pad: [
      { midi: C3, start: 0, dur: 4 },
      { midi: G3, start: 4, dur: 4 },
      { midi: A2, start: 8, dur: 4 },
      { midi: F3, start: 12, dur: 4 },
      { midi: C3, start: 16, dur: 4 },
      { midi: G3, start: 20, dur: 4 },
      { midi: F3, start: 24, dur: 4 },
      { midi: C3, start: 28, dur: 4 },
    ],
  },
  {
    id: "track-caravan-of-stars",
    title: "Caravan of Stars",
    origin: "Ancient Middle East",
    hint: "a night wind through old stone, breath of the ney",
    timbre: "ney",
    bpm: 66,
    loopBeats: 32,
    melody: [
      { midi: D4, start: 0, dur: 2 },
      { midi: Fs4, start: 2, dur: 1 },
      { midi: G4, start: 3, dur: 1 },
      { midi: A4, start: 4, dur: 3 },
      { midi: Bb4, start: 7, dur: 1 },
      { midi: A4, start: 8, dur: 2 },
      { midi: G4, start: 10, dur: 1 },
      { midi: Fs4, start: 11, dur: 1 },
      { midi: Eb4, start: 12, dur: 2 },
      { midi: D4, start: 14, dur: 4 },
      { midi: A4, start: 18, dur: 1 },
      { midi: C5, start: 19, dur: 1 },
      { midi: Bb4, start: 20, dur: 1.5 },
      { midi: A4, start: 21.5, dur: 0.5 },
      { midi: G4, start: 22, dur: 2 },
      { midi: Fs4, start: 24, dur: 1 },
      { midi: Eb4, start: 25, dur: 1 },
      { midi: D4, start: 26, dur: 4 },
    ],
    pad: [
      { midi: D3, start: 0, dur: 16 },
      { midi: D3, start: 16, dur: 16 },
    ],
    drum: [0, 8, 16, 24].flatMap((beat) => [
      { start: beat, kind: "dum" as const },
      { start: beat + 3, kind: "tak" as const },
      { start: beat + 4, kind: "dum" as const },
    ]),
  },
];

export function getTrack(id: string): Track | undefined {
  return TRACKS.find((track) => track.id === id);
}

export function randomTrackId(): string {
  return TRACKS[Math.floor(Math.random() * TRACKS.length)].id;
}

export function nextTrackId(id: string, step: 1 | -1): string {
  const index = TRACKS.findIndex((track) => track.id === id);
  const base = index === -1 ? 0 : index;
  const next = (base + step + TRACKS.length) % TRACKS.length;
  return TRACKS[next].id;
}

/** Filenames the owner can drop into `public/music/` to override a track. */
export function trackFileCandidates(id: string): string[] {
  // Respect a deploy-time base path (GitHub Pages serves under /emma-fortune/).
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return [`${base}/music/${id}.mp3`, `${base}/music/${id}.m4a`, `${base}/music/${id}.ogg`];
}
