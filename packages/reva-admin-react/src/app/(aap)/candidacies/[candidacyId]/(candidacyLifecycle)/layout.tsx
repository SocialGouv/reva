"use client";

import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const CandidacyLifecycleLayout = ({
  children,
  params: { candidacyId },
}: {
  children: ReactNode;
  params: { candidacyId: string };
}) => {
  const path = usePathname();

  const isDropOutPath = path.endsWith("/drop-out/");

  return (
    <>
      {!isDropOutPath && <CandidacyBackButton candidacyId={candidacyId} />}
      {children}
    </>
  );
};

export default CandidacyLifecycleLayout;
