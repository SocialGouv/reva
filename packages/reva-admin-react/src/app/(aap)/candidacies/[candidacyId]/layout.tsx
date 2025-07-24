"use client";

import { ReactNode } from "react";

import { AapCandidacyLayout } from "@/components/aap-candidacy-layout/AapCandidacyLayout";

const CandidacySummaryLayout = ({ children }: { children: ReactNode }) => (
  <AapCandidacyLayout>{children}</AapCandidacyLayout>
);

export default CandidacySummaryLayout;
