import type { Metadata } from "next";
import { BankView } from "@/components/bank/BankView";

export const metadata: Metadata = {
  title: "Birthday Bank",
};

export default function BankPage() {
  return <BankView />;
}
