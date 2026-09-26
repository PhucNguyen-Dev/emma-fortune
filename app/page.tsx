import type { Metadata } from "next";
import { OverviewView } from "@/components/overview/OverviewView";

export const metadata: Metadata = {
  title: "Happy Birthday to Ng Thanh Ngân - my only love",
};

export default function HomePage() {
  return <OverviewView />;
}
