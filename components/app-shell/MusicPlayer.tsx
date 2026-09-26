"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/state/AppStateContext";
import { musicEngine } from "@/lib/music/engine";
import {
  TRACKS,
  nextTrackId,
  randomTrackId,
} from "@/lib/music/tracks";
import { cn } from "@/lib/utils/cn";

/**
 * A hidden little music box. The button lives quietly in the footer — nothing
 * points at it; she gets to find it. The first time she touches the screen,
 * a random track begins underneath everything, starting soft and swelling
 * until it fills the room.
 */
export function MusicPlayer() {
  const { state, hydrated, patchPreferences, showToast } = useAppState();
  const [open, setOpen] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const startedRef = useRef(false);
  const prefsRef = useRef(state.preferences);

  useEffect(() => {
    prefsRef.current = state.preferences;
  }, [state.preferences]);

  // Autoplay on her first touch anywhere — random track, just once.
  useEffect(() => {
    if (!hydrated || startedRef.current) return;
    if (prefsRef.current.musicEnabled === false) return;

    const handler = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const trackId = prefsRef.current.musicTrackId ?? randomTrackId();
      void musicEngine.play(trackId).then((ok) => {
        if (ok) {
          setPlayingId(trackId);
        } else {
          // A stored id can go stale (e.g. the owner renamed a track) —
          // fall back to a random song so the room is never silent.
          const fallback = randomTrackId();
          void musicEngine.play(fallback).then((ok2) => {
            if (ok2) setPlayingId(fallback);
          });
        }
      });
    };
    window.addEventListener("pointerdown", handler, { once: true, passive: true });
    return () => window.removeEventListener("pointerdown", handler);
  }, [hydrated]);

  function togglePlay() {
    if (musicEngine.isPlaying) {
      musicEngine.pause();
      setPlayingId(null);
      patchPreferences({ musicEnabled: false, musicTrackId: musicEngine.currentId ?? undefined });
      return;
    }
    const trackId = musicEngine.currentId ?? prefsRef.current.musicTrackId ?? randomTrackId();
    void musicEngine.play(trackId).then((ok) => {
      if (ok) {
        setPlayingId(trackId);
        patchPreferences({ musicEnabled: true, musicTrackId: trackId });
      } else {
        showToast("The music box needs one more little tap.", "info");
      }
    });
  }

  function switchTrack(trackId: string) {
    void musicEngine.play(trackId).then((ok) => {
      if (!ok) return;
      setPlayingId(trackId);
      patchPreferences({ musicEnabled: true, musicTrackId: trackId });
      const track = TRACKS.find((entry) => entry.id === trackId);
      if (track) showToast(`“${track.title}” — for you. 🎵`);
    });
  }

  function skip() {
    const from = musicEngine.currentId ?? playingId ?? TRACKS[0].id;
    switchTrack(nextTrackId(from, 1));
  }

  const playing = playingId !== null;
  const currentTrack = TRACKS.find((track) => track.id === playingId);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="A hidden little music box"
        title="a little music lives here"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-muted transition-colors hover:bg-blush hover:text-plum",
          open && "bg-blush text-plum",
        )}
      >
        <Music2
          className={cn("h-4 w-4", playing && "animate-sparkle text-champagne-deep")}
          aria-hidden
        />
        {playing && (
          <span className="sr-only">music is playing</span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="The hidden music box"
          className="fixed inset-x-4 bottom-20 z-50 mx-auto w-auto max-w-sm rounded-2xl border border-plum/10 bg-ivory p-4 shadow-(--shadow-luxe) sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-plum">
                {currentTrack ? currentTrack.title : "A hidden music box"}
              </p>
              <p className="truncate text-xs text-muted">
                {currentTrack
                  ? currentTrack.origin
                  : "five little songs, one for each corner of her world"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button size="icon" aria-label={playing ? "Pause the music" : "Play the music"} onClick={togglePlay}>
                {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              </Button>
              <Button size="icon" variant="secondary" aria-label="Play the next song" onClick={skip}>
                <SkipForward className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>

          <ul className="mt-3 flex flex-col gap-1">
            {TRACKS.map((track) => {
              const active = track.id === playingId;
              return (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => switchTrack(track.id)}
                    aria-pressed={active}
                    className={cn(
                      "w-full rounded-xl px-3 py-2.5 text-left transition-colors",
                      active ? "bg-plum text-ivory" : "hover:bg-blush/70",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {track.title}
                        </span>
                        <span
                          className={cn(
                            "block truncate text-xs",
                            active ? "text-ivory/75" : "text-muted",
                          )}
                        >
                          {track.origin} · {track.hint}
                        </span>
                      </span>
                      {active && (
                        <Music2 className="h-3.5 w-3.5 shrink-0 animate-sparkle" aria-hidden />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
            The music begins softly, then grows — like every good evening.
          </p>
        </div>
      )}
    </div>
  );
}
