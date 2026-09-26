import type { Metadata } from "next";
import { LetterView } from "@/components/letter/LetterView";

export const metadata: Metadata = {
  title: "My Letter",
};

export default function LetterPage() {
  return <LetterView />;
}
