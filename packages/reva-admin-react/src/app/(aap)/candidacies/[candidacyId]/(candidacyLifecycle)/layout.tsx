"use client";

import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { ReactNode } from "react";

const CandidacyLifecycleLayout = ({
  children,
  params: { candidacyId },
}: {
  children: ReactNode;
  params: { candidacyId: string };
}) => {
  return (
    <>
      <CandidacyBackButton candidacyId={candidacyId} /> {children}
    </>
  );
};

export default CandidacyLifecycleLayout;
