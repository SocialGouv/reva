import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidatesGuard } from "./CandidatesGuard.hook";

export const CandidatesGuard = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { candidate, isLoading } = useCandidatesGuard();

  const router = useRouter();

  const { candidateId } = useParams<{
    candidateId: string;
  }>();

  useEffect(() => {
    if (!candidateId && candidate?.id) {
      router.push(`./${candidate.id}`);
      return;
    }
  }, [candidateId, candidate?.id, router]);

  if (isLoading || !candidateId) {
    return <LoaderWithLayout />;
  }

  return children;
};
