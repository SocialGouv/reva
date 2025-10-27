"use client";

import { CandidateGuard } from "../../_components/guards/CandidateGuard";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CandidateGuard>{children}</CandidateGuard>;
}
