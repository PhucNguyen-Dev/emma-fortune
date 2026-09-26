import type { Metadata } from "next";
import { OverviewView } from "@/components/overview/OverviewView";

export const metadata: Metadata = {
  title: "Happy Birthday",
};

export default function HomePage() {
  return <OverviewView />;
}
