import type { Metadata } from "next";
import { FundView } from "@/components/fund/FundView";

export const metadata: Metadata = {
  title: "Future Fund",
};

export default function FundPage() {
  return <FundView />;
}
