"use client";

import { CandidacyGuard } from "../_components/guards/CandidacyGuard";

export default function CandidacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CandidacyGuard>{children}</CandidacyGuard>;
}
