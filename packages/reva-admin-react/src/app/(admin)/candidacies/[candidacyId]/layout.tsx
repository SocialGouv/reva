"use client";

import { AapCandidacyLayout } from "@/components/aap-candidacy-layout/AapCandidacyLayout";
import { ReactNode } from "react";

const CandidacyLayout = ({ children }: { children: ReactNode }) => (
  <AapCandidacyLayout>{children}</AapCandidacyLayout>
);

export default CandidacyLayout;
