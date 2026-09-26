"use client";

import { useState } from "react";
import { BookOpen, Heart, MailOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { useAppState } from "@/lib/state/AppStateContext";

export function LetterView() {
  const { state } = useAppState();
  const { config } = state;
  const [opened, setOpened] = useState(false);
  const reasons = config.letter.personalReasons.filter(
    (reason) => reason.trim().length > 0,
  );
  const paragraphs = config.letter.body.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="The most valuable thing here"
        title="My Letter"
        subtitle="No points, no funds, no lists. Just the true part."
        badge={<Badge tone="rose">From {config.senderName}</Badge>}
      />

      {!opened ? (
        <section aria-label="Sealed letter" className="flex flex-col items-center py-8">
          <button
            type="button"
            onClick={() => setOpened(true)}
            aria-expanded={opened}
            aria-label="Open the letter"
            className="group relative w-full max-w-md cursor-pointer rounded-2xl focus-visible:outline-2"
          >
            <div className="card-sheen relative overflow-hidden rounded-2xl p-8 shadow-(--shadow-luxe) transition-transform duration-300 group-hover:-translate-y-1">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-champagne text-plum-deep shadow-md">
                <MailOpen className="h-7 w-7" aria-hidden />
              </div>
              <p className="mt-5 text-center font-display text-2xl font-semibold text-ivory">
                A letter for {config.recipientName}
              </p>
              <p className="mt-2 text-center text-sm text-ivory/75">
                Sealed with a kiss and a completely unreasonable amount of thought.
              </p>
              <div className="mt-6 text-center">
                <span className="inline-flex min-h-11 items-center rounded-xl bg-ivory px-5 font-medium text-plum">
                  Open letter
                </span>
              </div>
            </div>
            <span
              aria-hidden
              className="absolute -right-3 -top-3 flex h-10 w-10 rotate-12 items-center justify-center rounded-full bg-rose text-ivory shadow-md"
            >
              <Heart className="h-5 w-5" fill="currentColor" />
            </span>
          </button>
        </section>
      ) : (
        <section aria-label="The letter" className="animate-fade-up">
          <article className="paper-texture mx-auto max-w-2xl rounded-2xl border border-champagne/40 bg-white px-6 py-10 shadow-(--shadow-luxe) sm:px-10 sm:py-12">
            <p className="font-display text-2xl font-semibold text-plum">
              {config.letter.salutation}
            </p>
            <div className="mt-6 flex flex-col gap-5">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-[15px] leading-8 text-ink/90 break-words">
                  {paragraph}
                </p>
              ))}
            </div>

            {reasons.length > 0 ? (
              <div className="mt-8 rounded-xl bg-blush/50 px-5 py-5">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-plum">
                  <Sparkles className="h-4 w-4 text-champagne-deep" aria-hidden />
                  Things I love about you
                </h2>
                <ul className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-ink/85">
                  {reasons.map((reason, index) => (
                    <li key={index} className="break-words">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-10 text-right">
              <p className="font-display text-xl text-plum italic">{config.letter.signOff}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-rose-deep">
                {config.senderName}
              </p>
            </div>
          </article>

          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={() => setOpened(false)}>
              <BookOpen className="h-4 w-4" aria-hidden />
              Read it again
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
