import { useParams, usePathname, useRouter } from "next/navigation";
import React from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidateGuard } from "./CandidateGuard.hook";

export const CandidateGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isError, candidate } = useCandidateGuard();

  const pathname = usePathname();
  const router = useRouter();
  const { candidateId } = useParams<{ candidateId: string }>();

  if (isLoading) {
    return <LoaderWithLayout />;
  }

  if (isError) {
    return <div>Vous n'avez pas accès à ce candidat</div>;
  }

  if (
    candidate &&
    (!candidate.civilInformationCompleted ||
      !candidate.contactInformationCompleted ||
      !candidate.typologyAndCollectiveAgreementCompleted) &&
    !pathname.includes("/first-connexion")
  ) {
    router.push(`/candidates/${candidateId}/first-connexion`);
    return <LoaderWithLayout />;
  }

  return children;
};
