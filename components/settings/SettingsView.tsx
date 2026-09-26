"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, Trash2, Upload } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  SettingsSection,
  SaveButton,
  useDraft,
} from "@/components/settings/SettingsParts";
import { useAppState } from "@/lib/state/AppStateContext";
import { createDefaultState } from "@/lib/config/defaults";
import { TRACKS } from "@/lib/music/tracks";
import {
  deleteTrackFile,
  isAcceptableTrackFile,
  listUploadedTrackIds,
  saveTrackFile,
} from "@/lib/music/userTracks";
import { parsePositiveAmount } from "@/lib/utils/fund";
import {
  parseImportedJson,
  validateImportedState,
} from "@/lib/storage/repository";
import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_LOCALES,
} from "@/types";

function ProfileSection() {
  const { state, patchConfig, patchPreferences } = useAppState();
  const { config, preferences } = state;
  const { draft, setDraft } = useDraft({
    recipientName: config.recipientName,
    senderName: config.senderName,
    birthdayDate: config.birthdayDate ?? "",
    appTitle: config.appTitle,
    tagline: config.tagline,
  });

  function save(): boolean {
    if (draft.recipientName.trim().length === 0 || draft.senderName.trim().length === 0) {
      return false;
    }
    patchConfig({
      recipientName: draft.recipientName.trim(),
      senderName: draft.senderName.trim(),
      birthdayDate: draft.birthdayDate || undefined,
      appTitle: draft.appTitle.trim() || config.appTitle,
      tagline: draft.tagline.trim(),
    });
    return true;
  }

  return (
    <SettingsSection
      title="Profile & experience"
      description="Names, the big day, and how the app presents itself."
      footer={
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={preferences.reducedMotion === true}
              onChange={(event) => patchPreferences({ reducedMotion: event.target.checked })}
              className="h-4 w-4 accent-[#54243f]"
            />
            Reduce motion
          </label>
          <SaveButton onSave={save} />
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Recipient name" htmlFor="cfg-recipient">
          {(ariaProps) => (
            <Input
              {...ariaProps}
              value={draft.recipientName}
              maxLength={60}
              onChange={(event) =>
                setDraft((current) => ({ ...current, recipientName: event.target.value }))
              }
            />
          )}
        </Field>
        <Field
          label="Sender name"
          htmlFor="cfg-sender"
          hint="Replace “Your Love” with your real name before showing her."
        >
          {(ariaProps) => (
            <Input
              {...ariaProps}
              value={draft.senderName}
              maxLength={60}
              onChange={(event) =>
                setDraft((current) => ({ ...current, senderName: event.target.value }))
              }
            />
          )}
        </Field>
        <Field
          label="Birthday date (optional)"
          htmlFor="cfg-birthday"
          hint="Leave empty to hide the countdown badge."
        >
          {(ariaProps) => (
            <Input
              {...ariaProps}
              type="date"
              value={draft.birthdayDate}
              onChange={(event) =>
                setDraft((current) => ({ ...current, birthdayDate: event.target.value }))
              }
            />
          )}
        </Field>
        <Field label="App title" htmlFor="cfg-title">
          {(ariaProps) => (
            <Input
              {...ariaProps}
              value={draft.appTitle}
              maxLength={80}
              onChange={(event) =>
                setDraft((current) => ({ ...current, appTitle: event.target.value }))
              }
            />
          )}
        </Field>
        <Field label="Tagline" htmlFor="cfg-tagline" className="sm:col-span-2">
          {(ariaProps) => (
            <Input
              {...ariaProps}
              value={draft.tagline}
              maxLength={200}
              onChange={(event) =>
                setDraft((current) => ({ ...current, tagline: event.target.value }))
              }
            />
          )}
        </Field>
      </div>
    </SettingsSection>
  );
}

function RegionSection() {
  const { state, patchConfig, showToast } = useAppState();
  const { config } = state;
  const { draft, setDraft } = useDraft({ currency: config.currency, locale: config.locale });

  return (
    <SettingsSection
      title="Region & formatting"
      description="Currency and number/date formatting. Content language stays as written."
      footer={<SaveButton onSave={() => {
        patchConfig({ currency: draft.currency.trim() || config.currency, locale: draft.locale.trim() || config.locale });
        return true;
      }} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Currency" htmlFor="cfg-currency" hint="Display only — amounts are never converted.">
          {(ariaProps) => (
            <Select
              {...ariaProps}
              value={draft.currency}
              onChange={(event) => setDraft((current) => ({ ...current, currency: event.target.value }))}
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Locale" htmlFor="cfg-locale" hint="Controls how numbers and dates look.">
          {(ariaProps) => (
            <Select
              {...ariaProps}
              value={draft.locale}
              onChange={(event) => setDraft((current) => ({ ...current, locale: event.target.value }))}
            >
              {SUPPORTED_LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {locale}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <p className="rounded-xl bg-blush/50 px-4 py-3 text-xs leading-relaxed text-plum">
        Changing the currency only changes how existing numbers are displayed — no exchange
        rates, no conversion, no finance. Amounts stay exactly as recorded.
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => showToast(`Preview: ${new Intl.NumberFormat(draft.locale, { style: "currency", currency: draft.currency }).format(1234567)}`, "info")}
      >
        Preview formatting
      </Button>
    </SettingsSection>
  );
}

function LetterSection() {
  const { state, patchConfig } = useAppState();
  const { config } = state;
  const { draft, setDraft } = useDraft(config.letter);

  return (
    <SettingsSection
      title="The letter"
      description="Make it sound like you. Recipients never see empty sections."
      footer={<SaveButton onSave={() => {
        patchConfig({ letter: { ...draft, personalReasons: draft.personalReasons.map((r) => r.trim()).filter(Boolean) } });
        return true;
      }} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Salutation" htmlFor="cfg-salutation">
          {(ariaProps) => (
            <Input
              {...ariaProps}
              value={draft.salutation}
              maxLength={120}
              onChange={(event) =>
                setDraft((current) => ({ ...current, salutation: event.target.value }))
              }
            />
          )}
        </Field>
        <Field label="Sign-off" htmlFor="cfg-signoff">
          {(ariaProps) => (
            <Input
              {...ariaProps}
              value={draft.signOff}
              maxLength={120}
              onChange={(event) =>
                setDraft((current) => ({ ...current, signOff: event.target.value }))
              }
            />
          )}
        </Field>
      </div>
      <Field label="Letter body" htmlFor="cfg-body" hint="Separate paragraphs with a blank line.">
        {(ariaProps) => (
          <Textarea
            {...ariaProps}
            rows={9}
            value={draft.body}
            onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
          />
        )}
      </Field>
      <div>
        <p className="text-sm font-medium text-plum">
          Things I love about you ({draft.personalReasons.length}/5)
        </p>
        <p className="mt-1 text-xs text-muted">
          Add 3–5 real things. If the list is empty, the whole section stays hidden from the
          recipient — she will never see a placeholder or an owner note on the letter page.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {draft.personalReasons.map((reason, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                aria-label={`Reason ${index + 1}`}
                value={reason}
                maxLength={240}
                onChange={(event) =>
                  setDraft((current) => {
                    const reasons = [...current.personalReasons];
                    reasons[index] = event.target.value;
                    return { ...current, personalReasons: reasons };
                  })
                }
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove reason ${index + 1}`}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    personalReasons: current.personalReasons.filter((_, i) => i !== index),
                  }))
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ))}
          {draft.personalReasons.length < 5 && (
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() =>
                setDraft((current) => ({ ...current, personalReasons: [...current.personalReasons, ""] }))
              }
            >
              Add a reason
            </Button>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}

function FundSection() {
  const { state, patchFund } = useAppState();
  const { config } = state;
  const { draft, setDraft } = useDraft({
    name: config.fund.name,
    description: config.fund.description,
    targetAmount: String(config.fund.targetAmount),
    targetDate: config.fund.targetDate ?? "",
  });
  const [error, setError] = useState<string | undefined>();

  return (
    <SettingsSection
      title="Future fund"
      description="Goal name, description, and target. Saved amounts always start at zero — and the recipient never sees any demo labels."
      footer={
        <SaveButton
          onSave={() => {
            const parsed = parsePositiveAmount(draft.targetAmount, { label: "Target amount" });
            if (!parsed.ok) {
              setError(parsed.error);
              return false;
            }
            setError(undefined);
            patchFund({
              name: draft.name.trim() || config.fund.name,
              description: draft.description.trim(),
              targetAmount: parsed.amount,
              targetDate: draft.targetDate || undefined,
            });
            return true;
          }}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Goal name" htmlFor="cfg-fund-name">
          {(ariaProps) => (
            <Input
              {...ariaProps}
              value={draft.name}
              maxLength={80}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            />
          )}
        </Field>
        <Field
          label="Target amount"
          htmlFor="cfg-fund-target"
          error={error}
          hint="Must be greater than zero."
        >
          {(ariaProps) => (
            <Input
              {...ariaProps}
              type="text"
              inputMode="decimal"
              value={draft.targetAmount}
              onChange={(event) =>
                setDraft((current) => ({ ...current, targetAmount: event.target.value }))
              }
            />
          )}
        </Field>
        <Field label="Description" htmlFor="cfg-fund-desc" className="sm:col-span-2">
          {(ariaProps) => (
            <Input
              {...ariaProps}
              value={draft.description}
              maxLength={300}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
            />
          )}
        </Field>
        <Field
          label="Target date (optional)"
          htmlFor="cfg-fund-date"
          hint="Leave empty to omit the deadline entirely."
        >
          {(ariaProps) => (
            <Input
              {...ariaProps}
              type="date"
              value={draft.targetDate}
              onChange={(event) =>
                setDraft((current) => ({ ...current, targetDate: event.target.value }))
              }
            />
          )}
        </Field>
      </div>
    </SettingsSection>
  );
}

function CouponsSection() {
  const { state, setCoupons } = useAppState();
  const { draft, setDraft } = useDraft(state.coupons);

  return (
    <SettingsSection
      title="Coupons"
      description="Edit what each little promise means and what it costs in fictional points. Only promise what you can sincerely deliver."
      footer={
        <SaveButton
          onSave={() => {
            const cleaned = draft.map((coupon) => ({
              ...coupon,
              title: coupon.title.trim(),
              description: coupon.description.trim(),
            }));
            setCoupons(cleaned);
            return true;
          }}
        />
      }
    >
      <div className="flex flex-col gap-4">
        {draft.map((coupon, index) => (
          <fieldset key={coupon.id} className="rounded-xl border border-plum/15 p-4">
            <legend className="px-1 text-xs font-semibold text-muted">
              Coupon {index + 1} · {coupon.status}
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Title" htmlFor={`coupon-title-${coupon.id}`}>
                {(ariaProps) => (
                  <Input
                    {...ariaProps}
                    value={coupon.title}
                    maxLength={80}
                    onChange={(event) =>
                      setDraft((current) =>
                        current.map((entry, i) =>
                          i === index ? { ...entry, title: event.target.value } : entry,
                        ),
                      )
                    }
                  />
                )}
              </Field>
              <Field
                label="Description"
                htmlFor={`coupon-desc-${coupon.id}`}
                className="sm:col-span-2"
              >
                {(ariaProps) => (
                  <Input
                    {...ariaProps}
                    value={coupon.description}
                    maxLength={300}
                    onChange={(event) =>
                      setDraft((current) =>
                        current.map((entry, i) =>
                          i === index ? { ...entry, description: event.target.value } : entry,
                        ),
                      )
                    }
                  />
                )}
              </Field>
              <Field label="Point cost (fictional)" htmlFor={`coupon-cost-${coupon.id}`}>
                {(ariaProps) => (
                  <Input
                    {...ariaProps}
                    type="text"
                    inputMode="decimal"
                    value={String(coupon.fictionalPointCost)}
                    onChange={(event) =>
                      setDraft((current) =>
                        current.map((entry, i) =>
                          i === index
                            ? { ...entry, fictionalPointCost: Number(event.target.value) || 0 }
                            : entry,
                        ),
                      )
                    }
                  />
                )}
              </Field>
            </div>
          </fieldset>
        ))}
      </div>
    </SettingsSection>
  );
}

function SpecialCardSection() {
  const { state, patchConfig, resetSpecialCard } = useAppState();
  const { config } = state;
  const { draft, setDraft } = useDraft(config.specialCard);
  const [error, setError] = useState<string | undefined>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTouched, setPreviewTouched] = useState(false);

  return (
    <SettingsSection
      title="The secret treasure"
      description="A rare card that can never be bought. It sleeps blurred in the Boutique until chance (or you) wakes it. This is yours to customize."
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(true)}>
            Preview the reveal
          </Button>
          <SaveButton
            onSave={() => {
              const rate = Number(draft.ratePercent);
              if (!Number.isFinite(rate) || rate <= 0 || rate > 100) {
                setError("Appearance chance must be a percentage between 0.0001 and 100.");
                return false;
              }
              setError(undefined);
              patchConfig({
                specialCard: {
                  title: draft.title.trim() || config.specialCard.title,
                  message: draft.message,
                  ratePercent: rate,
                },
              });
              return true;
            }}
          />
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Card title" htmlFor="cfg-special-title" className="sm:col-span-2">
          {(ariaProps) => (
            <Input
              {...ariaProps}
              value={draft.title}
              maxLength={120}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
            />
          )}
        </Field>
        <Field
          label="Appearance chance (%)"
          htmlFor="cfg-special-rate"
          error={error}
          hint="0.01 ≈ one appearance per 10,000 purchases."
        >
          {(ariaProps) => (
            <Input
              {...ariaProps}
              type="text"
              inputMode="decimal"
              value={String(draft.ratePercent)}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  ratePercent: Number(event.target.value) || 0,
                }))
              }
            />
          )}
        </Field>
      </div>
      <Field label="The message she'll read" htmlFor="cfg-special-message">
        {(ariaProps) => (
          <Textarea
            {...ariaProps}
            rows={5}
            maxLength={2000}
            value={draft.message}
            onChange={(event) =>
              setDraft((current) => ({ ...current, message: event.target.value }))
            }
          />
        )}
      </Field>
      <p className="rounded-xl bg-champagne/15 px-4 py-3 text-xs leading-relaxed text-plum">
        Heads-up: at the default 0.01% chance the card appears on about 1 in every 10,000
        boutique purchases — she may never meet it naturally. Raise the chance (e.g. 5) if
        you want her to find it, or tap “Preview the reveal” to see exactly what she&apos;ll
        see. The card stays openable once found; reset its found-state below if you want it
        hidden again.
      </p>
      <div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (window.confirm("Hide the treasure again? She will need luck to find it once more.")) {
              resetSpecialCard();
            }
          }}
        >
          Reset “found” state
        </Button>
      </div>

      <ConfirmDialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setPreviewTouched(false);
        }}
        title={previewTouched ? config.specialCard.title : "Something rare…"}
        body={
          previewTouched ? (
            <span className="whitespace-pre-line">{config.specialCard.message}</span>
          ) : (
            "This is what she'll see — first blurred, then revealed on tap. Tap “Reveal” to continue the preview."
          )
        }
        confirmLabel={previewTouched ? "Close preview" : "Reveal"}
        cancelLabel="Close"
        onConfirm={() => setPreviewTouched(true)}
      />
    </SettingsSection>
  );
}

function SongsSection() {
  const { showToast } = useAppState();
  const [uploads, setUploads] = useState<Record<string, boolean>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    void listUploadedTrackIds(TRACKS.map((track) => track.id)).then((map) => {
      setUploads(map);
    });
  }, []);

  async function refresh() {
    setUploads(await listUploadedTrackIds(TRACKS.map((track) => track.id)));
  }

  async function handleUpload(trackId: string, file: File | undefined) {
    if (!file) return;
    const check = isAcceptableTrackFile(file);
    if (!check.ok) {
      showToast(check.reason, "error");
      return;
    }
    try {
      await saveTrackFile(trackId, file);
      await refresh();
      const track = TRACKS.find((entry) => entry.id === trackId);
      showToast(`“${track?.title ?? "That song"}” will play from now on. 🎵`);
    } catch {
      showToast("This browser won't let us store songs right now.", "error");
    }
  }

  async function handleRemove(trackId: string) {
    try {
      await deleteTrackFile(trackId);
      await refresh();
      showToast("Back to the built-in melody.", "info");
    } catch {
      showToast("This browser won't let us store songs right now.", "error");
    }
  }

  return (
    <SettingsSection
      title="The songs"
      description="Replace any built-in melody with a recording you own — pick the file here, it plays from the hidden music box and stays in this browser only."
    >
      <div className="flex flex-col gap-2">
        {TRACKS.map((track) => {
          const hasUpload = uploads[track.id] === true;
          return (
            <div
              key={track.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-plum/15 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-plum">{track.title}</p>
                <p className="text-xs text-muted">
                  {track.origin} ·{" "}
                  {hasUpload ? (
                    <span className="font-medium text-champagne-deep">your recording</span>
                  ) : (
                    <span>built-in melody</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  ref={(element) => {
                    inputRefs.current[track.id] = element;
                  }}
                  type="file"
                  accept="audio/*,.mp3,.m4a,.ogg,.wav"
                  className="sr-only"
                  aria-label={`Upload a recording for ${track.title}`}
                  onChange={(event) => {
                    void handleUpload(track.id, event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => inputRefs.current[track.id]?.click()}
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  {hasUpload ? "Replace" : "Add a recording"}
                </Button>
                {hasUpload && (
                  <Button variant="ghost" size="sm" onClick={() => void handleRemove(track.id)}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="rounded-xl bg-blush/50 px-4 py-3 text-xs leading-relaxed text-plum">
        Songs stay on this device — clearing browser data erases them (exported app backups
        don&apos;t include recordings). MP3, M4A, OGG or WAV, up to 25 MB.
      </p>
    </SettingsSection>
  );
}

function DataSection() {
  const { state, showToast, resetDemoData, resetAllData, resetCoupons, replaceState } =
    useAppState();
  type PendingImport = { import: typeof state };
  const [confirm, setConfirm] = useState<
    null | "demo" | "all" | "coupons" | "contributions" | "wishlist" | PendingImport
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `emma-fortune-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded.", "info");
  }

  async function importData(file: File) {
    const text = await file.text();
    const parsed = parseImportedJson(text);
    if (!parsed.ok) {
      showToast(parsed.reason, "error");
      return;
    }
    const validated = validateImportedState(parsed.value);
    if (!validated.ok) {
      showToast(validated.reason, "error");
      return;
    }
    setConfirm({ import: validated.state });
  }

  return (
    <SettingsSection
      title="Data & privacy"
      description="Everything lives in this browser only. Back it up before clearing browser data."
    >
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={exportData}>
          <Download className="h-4 w-4" aria-hidden />
          Export backup (JSON)
        </Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" aria-hidden />
          Import backup
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Import backup file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importData(file);
            event.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-plum/15 p-4">
        <p className="text-sm font-medium text-plum">Reset options</p>
        <p className="text-xs text-muted">
          “Reset demo data” restores sample content but keeps your personalization. The other
          resets are narrower. All require confirmation.
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setConfirm("demo")}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset demo data
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setConfirm("coupons")}>
            Reset redeemed coupons
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setConfirm("contributions")}>
            Reset fund contributions
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setConfirm("wishlist")}>
            Reset wishlist
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-rose-deep/40 bg-rose/5 p-4">
        <p className="text-sm font-semibold text-rose-deep">Danger zone</p>
        <p className="text-xs text-muted">
          “Reset all data” erases everything — personalization, letter, coupons, contributions,
          wishlist — and restores the factory demo. This cannot be undone.
        </p>
        <Button variant="danger" size="sm" className="self-start" onClick={() => setConfirm("all")}>
          <Trash2 className="h-4 w-4" aria-hidden />
          Reset all data
        </Button>
      </div>

      <ConfirmDialog
        open={confirm === "demo"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Reset demo data?"
        body="Coupons become available again, contributions and wishlist return to samples. Your profile, letter, and fund goal are kept."
        confirmLabel="Reset demo data"
        onConfirm={() => {
          resetDemoData();
          showToast("Demo data restored.", "info");
        }}
      />
      <ConfirmDialog
        open={confirm === "all"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Reset ALL data?"
        body="Everything — including the letter, names, and all records — returns to factory defaults. This cannot be undone. Export a backup first if in doubt."
        confirmLabel="Erase everything"
        danger
        onConfirm={() => {
          resetAllData();
          showToast("All data reset to factory defaults.", "info");
        }}
      />
      <ConfirmDialog
        open={confirm === "coupons"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Reset redeemed coupons?"
        body="All coupons become available again and the activity feed is cleared."
        confirmLabel="Reset coupons"
        onConfirm={() => {
          resetCoupons();
          showToast("Coupons reset.", "info");
        }}
      />
      <ConfirmDialog
        open={confirm === "contributions"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Reset fund contributions?"
        body="All recorded contributions are deleted. The saved amount returns to zero."
        confirmLabel="Delete contributions"
        danger
        onConfirm={() => {
          replaceState({
            ...state,
            contributions: [],
            preferences: { ...state.preferences, fundGoalReached: false },
          });
          showToast("Contributions cleared.", "info");
        }}
      />
      <ConfirmDialog
        open={confirm === "wishlist"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Reset wishlist?"
        body="Your wishlist returns to the sample catalog. Custom wishes will be lost."
        confirmLabel="Reset wishlist"
        onConfirm={() => {
          replaceState({ ...state, wishlist: createDefaultState().wishlist });
          showToast("Wishlist reset to samples.", "info");
        }}
      />
      <ConfirmDialog
        open={typeof confirm === "object" && confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Import this backup?"
        body="It will replace everything currently in the app. This cannot be undone."
        confirmLabel="Replace data"
        danger
        onConfirm={() => {
          if (typeof confirm === "object" && confirm !== null) {
            replaceState(confirm.import);
            showToast("Backup imported. 📦");
          }
        }}
      />
    </SettingsSection>
  );
}

function PreviewSection() {
  const { state, patchPreferences } = useAppState();
  const mode = state.preferences.previewMode ?? "recipient";
  return (
    <SettingsSection
      title="Preview mode"
      description="The app always opens in recipient view — she only ever sees her world. Switch to owner view while you personalize; switch back before showing her."
    >
      <div className="flex gap-2" role="group" aria-label="Preview mode">
        {(["owner", "recipient"] as const).map((value) => (
          <Button
            key={value}
            variant={mode === value ? "primary" : "secondary"}
            aria-pressed={mode === value}
            onClick={() => patchPreferences({ previewMode: value })}
          >
            {value === "owner" ? "Owner view" : "Recipient view"}
          </Button>
        ))}
      </div>
    </SettingsSection>
  );
}

export function SettingsView() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Owner only · She can browse without this"
        title="Settings"
        subtitle="Personalize everything, back data up, and reset safely. Changes save to this browser instantly."
        badge={<Badge tone="outline">Private · Local only</Badge>}
      />
      <PreviewSection />
      <ProfileSection />
      <RegionSection />
      <LetterSection />
      <FundSection />
      <SpecialCardSection />
      <SongsSection />
      <CouponsSection />
      <DataSection />
    </div>
  );
}
