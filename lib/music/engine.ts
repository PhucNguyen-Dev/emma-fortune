"use client";

import {
  getTrack,
  midiToFreq,
  trackFileCandidates,
  type NoteEvent,
  type Track,
} from "@/lib/music/tracks";
import { getTrackFile } from "@/lib/music/userTracks";

/**
 * A tiny Web Audio engine. Every voice is synthesized live — no audio files —
 * unless the owner dropped a recording into `public/music/` with the track id
 * as its filename.
 *
 * Volume choreography per the gift: each track begins at a medium level for
 * twenty seconds, then swells to full richness over the next ten.
 */

const MEDIUM_GAIN = 0.35;
const MAX_GAIN = 0.9;
const SWELL_START_S = 20;
const SWELL_DURATION_S = 10;

class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private activeNodes: AudioScheduledSourceNode[] = [];
  private schedulerTimer: number | null = null;
  private nextLoopTime = 0;
  private currentTrackId: string | null = null;
  private mp3Url: string | null = null;
  private mp3Element: HTMLAudioElement | null = null;

  get isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);
  }

  get currentId(): string | null {
    return this.currentTrackId;
  }

  get isPlaying(): boolean {
    if (this.mp3Element) return !this.mp3Element.paused;
    return this.ctx?.state === "running";
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    void this.ctx.resume();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0001;
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 4;
    this.master.connect(compressor).connect(this.ctx.destination);

    // One second of white noise, reused by breathy and percussive voices.
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buffer;

    return this.ctx;
  }

  private remember(node: AudioScheduledSourceNode): void {
    this.activeNodes.push(node);
    node.onended = () => {
      this.activeNodes = this.activeNodes.filter((entry) => entry !== node);
    };
  }

  /** The 20s-medium-then-max volume swell, applied on every track start. */
  private applyVolumeSwell(): void {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    const gain = this.master.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(0.0001, now);
    gain.linearRampToValueAtTime(MEDIUM_GAIN, now + 1.5);
    gain.setValueAtTime(MEDIUM_GAIN, now + SWELL_START_S);
    gain.linearRampToValueAtTime(MAX_GAIN, now + SWELL_START_S + SWELL_DURATION_S);
  }

  /** If the owner provided a recording for this track, play it instead. */
  /** Plays an owner-supplied recording (uploaded in Settings or dropped in /music). */
  private async playRecording(src: string, trackId: string): Promise<boolean> {
    this.stopSynth();
    this.mp3Element?.pause();
    if (this.mp3Url && this.mp3Url.startsWith("blob:")) {
      URL.revokeObjectURL(this.mp3Url);
    }
    this.mp3Url = src;
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = MEDIUM_GAIN;
    try {
      await audio.play();
    } catch {
      return false;
    }
    this.mp3Element = audio;
    // The soft-then-swelling volume applies to recordings too.
    const swell = window.setInterval(() => {
      if (!this.mp3Element) {
        window.clearInterval(swell);
        return;
      }
      const elapsed = this.mp3Element.currentTime;
      if (elapsed >= SWELL_START_S) {
        this.mp3Element.volume = MAX_GAIN;
        window.clearInterval(swell);
      } else if (elapsed > SWELL_START_S - SWELL_DURATION_S) {
        const t = (elapsed - (SWELL_START_S - SWELL_DURATION_S)) / SWELL_DURATION_S;
        this.mp3Element.volume = Math.min(MAX_GAIN, MEDIUM_GAIN + t * (MAX_GAIN - MEDIUM_GAIN));
      }
    }, 500);
    this.currentTrackId = trackId;
    return true;
  }

  private async tryRecording(track: Track): Promise<boolean> {
    // 1) A recording the owner uploaded in Settings (stored in IndexedDB).
    try {
      const blob = await getTrackFile(track.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        if (await this.playRecording(url, track.id)) return true;
        URL.revokeObjectURL(url);
      }
    } catch {
      // song locker unavailable — fall through to public files
    }
    // 2) A file the owner dropped into public/music/.
    for (const url of trackFileCandidates(track.id)) {
      try {
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) continue;
        if (await this.playRecording(url, track.id)) return true;
      } catch {
        // try the next candidate extension
      }
    }
    return false;
  }

  async play(trackId: string): Promise<boolean> {
    const track = getTrack(trackId);
    if (!track) return false;
    this.currentTrackId = trackId;

    if (await this.tryRecording(track)) return true;
    this.mp3Element?.pause();
    this.mp3Element = null;

    const ctx = this.ensureContext();
    if (!ctx || !this.master) return false;
    await ctx.resume();

    this.stopSynth();
    this.applyVolumeSwell();
    this.nextLoopTime = ctx.currentTime + 0.2;
    this.scheduleLoop(track, this.nextLoopTime);
    this.nextLoopTime += (60 / track.bpm) * track.loopBeats;

    if (this.schedulerTimer !== null) window.clearInterval(this.schedulerTimer);
    this.schedulerTimer = window.setInterval(() => {
      if (!this.ctx) return;
      const lookahead = 2;
      while (this.nextLoopTime < this.ctx.currentTime + lookahead) {
        this.scheduleLoop(track, this.nextLoopTime);
        this.nextLoopTime += (60 / track.bpm) * track.loopBeats;
      }
    }, 400);
    return true;
  }

  pause(): void {
    this.mp3Element?.pause();
    void this.ctx?.suspend();
  }

  async resumeTrack(): Promise<boolean> {
    if (this.mp3Element) {
      await this.mp3Element.play();
      return true;
    }
    if (this.ctx) {
      await this.ctx.resume();
      return true;
    }
    return false;
  }

  private stopSynth(): void {
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    for (const node of this.activeNodes) {
      try {
        node.stop();
      } catch {
        // already finished
      }
    }
    this.activeNodes = [];
  }

  private scheduleLoop(track: Track, loopStart: number): void {
    const spb = 60 / track.bpm;
    for (const note of track.melody) {
      this.playMelodyVoice(track, note, loopStart + note.start * spb, note.dur * spb);
    }
    for (const note of track.pad) {
      this.playPad(note, loopStart + note.start * spb, note.dur * spb);
    }
    for (const hit of track.drum ?? []) {
      this.playDrum(hit.kind, loopStart + hit.start * spb);
    }
  }

  private track(time: number, midi: number, vel: number): { osc: OscillatorNode; freq: number } {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const freq = midiToFreq(midi);
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = vel;
    osc.connect(gain);
    this.remember(osc);
    return { osc, freq };
  }

  private playMelodyVoice(track: Track, note: NoteEvent, when: number, dur: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const vel = (note.vel ?? 0.5) * 0.5;

    if (track.timbre === "music-box") {
      // Bell-like: fundamental + soft upper partials, long decay.
      const env = ctx.createGain();
      env.gain.setValueAtTime(vel, when);
      env.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(dur * 1.4, 1.6));
      env.connect(master);
      for (const [ratio, level] of [[1, 1], [3, 0.22], [5.4, 0.07]] as const) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = midiToFreq(note.midi) * ratio;
        const partial = ctx.createGain();
        partial.gain.value = level;
        osc.connect(partial).connect(env);
        osc.start(when);
        osc.stop(when + Math.max(dur * 1.4, 1.6) + 0.1);
        this.remember(osc);
      }
      return;
    }

    if (track.timbre === "ud" || track.timbre === "guzheng" || track.timbre === "dan-tranh") {
      // Plucked strings: quick attack, exponential ring, per-culture color.
      const env = ctx.createGain();
      const ring = Math.max(dur * 1.25, 0.7);
      env.gain.setValueAtTime(0.0001, when);
      env.gain.linearRampToValueAtTime(vel, when + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, when + ring);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = track.timbre === "ud" ? 1700 : 2400;
      filter.Q.value = 0.8;
      filter.connect(env).connect(master);

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      const freq = midiToFreq(note.midi);
      if (track.timbre === "guzheng") {
        // bend into the note like a pull on the string
        osc.frequency.setValueAtTime(freq * 1.1, when);
        osc.frequency.exponentialRampToValueAtTime(freq, when + 0.09);
      } else {
        osc.frequency.value = freq;
      }
      osc.connect(filter);
      osc.start(when);
      osc.stop(when + ring + 0.05);
      this.remember(osc);

      const shimmer = ctx.createOscillator();
      shimmer.type = "sine";
      shimmer.frequency.value = freq * 2;
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.value = 0.12;
      shimmer.connect(shimmerGain).connect(filter);
      shimmer.start(when);
      shimmer.stop(when + ring + 0.05);
      this.remember(shimmer);

      if (track.timbre === "dan-tranh") {
        // a singing vibrato, like a zither player's left hand
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 5.5;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = freq * 0.006;
        lfo.connect(lfoGain).connect(osc.frequency);
        lfo.start(when + Math.min(0.12, dur / 3));
        lfo.stop(when + ring);
        this.remember(lfo);
      }
      return;
    }

    if (track.timbre === "piano") {
      // A warm, rounded pop-ballad piano: soft attack, gentle body, twin strings.
      const env = ctx.createGain();
      const ring = Math.max(dur * 1.35, 1.1);
      env.gain.setValueAtTime(0.0001, when);
      env.gain.linearRampToValueAtTime(vel, when + 0.012);
      env.gain.exponentialRampToValueAtTime(vel * 0.18, when + Math.max(dur * 0.9, 0.5));
      env.gain.linearRampToValueAtTime(0.0001, when + ring);
      env.connect(master);

      const freq = midiToFreq(note.midi);
      for (const [ratio, level, detune] of [[1, 1, 0], [1, 1, 5], [2, 0.18, 0]] as const) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq * ratio;
        osc.detune.value = detune;
        const partial = ctx.createGain();
        partial.gain.value = level;
        osc.connect(partial).connect(env);
        osc.start(when);
        osc.stop(when + ring + 0.05);
        this.remember(osc);
      }
      return;
    }

    // "ney": breathy flute with a slow, singing attack.
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(vel, when + 0.09);
    env.gain.setValueAtTime(vel, when + Math.max(dur - 0.25, 0.1));
    env.gain.linearRampToValueAtTime(0.0001, when + dur + 0.2);
    env.connect(master);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = midiToFreq(note.midi);
    osc.connect(env);
    osc.start(when);
    osc.stop(when + dur + 0.25);
    this.remember(osc);

    if (this.noiseBuffer) {
      const breath = ctx.createBufferSource();
      breath.buffer = this.noiseBuffer;
      breath.loop = true;
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = midiToFreq(note.midi);
      band.Q.value = 12;
      const breathGain = ctx.createGain();
      breathGain.gain.value = vel * 0.12;
      breath.connect(band).connect(breathGain).connect(env);
      breath.start(when);
      breath.stop(when + dur + 0.25);
      this.remember(breath);
    }

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 4.6;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = midiToFreq(note.midi) * 0.004;
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start(when + 0.15);
    lfo.stop(when + dur + 0.25);
    this.remember(lfo);
  }

  private playPad(note: NoteEvent, when: number, dur: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(0.05, when + 1.4);
    env.gain.setValueAtTime(0.05, when + Math.max(dur - 1.2, 1.4));
    env.gain.linearRampToValueAtTime(0.0001, when + dur + 1);
    env.connect(master);

    for (const detune of [-4, 4]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = midiToFreq(note.midi);
      osc.detune.value = detune;
      osc.connect(env);
      osc.start(when);
      osc.stop(when + dur + 1.1);
      this.remember(osc);
    }
  }

  private playDrum(kind: "dum" | "tak", when: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;

    if (kind === "dum") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(130, when);
      osc.frequency.exponentialRampToValueAtTime(58, when + 0.12);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.28, when);
      env.gain.exponentialRampToValueAtTime(0.0001, when + 0.3);
      osc.connect(env).connect(master);
      osc.start(when);
      osc.stop(when + 0.35);
      this.remember(osc);
      return;
    }

    if (this.noiseBuffer) {
      const tap = ctx.createBufferSource();
      tap.buffer = this.noiseBuffer;
      const band = ctx.createBiquadFilter();
      band.type = "highpass";
      band.frequency.value = 3200;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.09, when);
      env.gain.exponentialRampToValueAtTime(0.0001, when + 0.08);
      tap.connect(band).connect(env).connect(master);
      tap.start(when);
      tap.stop(when + 0.1);
      this.remember(tap);
    }
  }
}

// Module-level singleton — one audio world per browser tab.
export const musicEngine = new MusicEngine();
