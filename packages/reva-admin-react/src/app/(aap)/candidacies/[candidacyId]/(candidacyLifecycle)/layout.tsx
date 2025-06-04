"use client";

import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { usePathname } from "next/navigation";

const CandidacyLifecycleLayout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { candidacyId: string };
}) => {
  const path = usePathname();

  const isDropOutPath = path.endsWith("/drop-out/");

  const { candidacyId } = params;

  return (
    <>
      {!isDropOutPath && <CandidacyBackButton candidacyId={candidacyId} />}
      {children}
    </>
  );
};

export default CandidacyLifecycleLayout;
