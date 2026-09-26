"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/card";
import { GoalCard } from "@/components/fund/GoalCard";
import { ContributionForm } from "@/components/fund/ContributionForm";
import { ContributionList } from "@/components/fund/ContributionList";
import { useAppState } from "@/lib/state/AppStateContext";

export function FundView() {
  const { state } = useAppState();
  const { config } = state;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Patient · True · Ours"
        title="Future Fund"
        subtitle="A little fund for something you really want — built one true step at a time."
        badge={<Badge tone="champagne">A promise jar for dreams</Badge>}
      />

      <GoalCard />

      <ContributionForm />

      <ContributionList />

      <p className="text-xs leading-relaxed text-muted">
        Coins here simply wear the clothes of {config.currency} — their meaning never
        changes, and nothing real is ever moved. This jar belongs to two people and one
        beautiful dream.
      </p>
    </div>
  );
}
