import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidaciesGuard } from "./CandidaciesGuard.hook";

export const CandidaciesGuard = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { candidate, isLoading } = useCandidaciesGuard();

  const router = useRouter();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const candidacies = useMemo(() => candidate?.candidacies || [], [candidate]);

  useEffect(() => {
    if (!candidacyId && candidacies.length > 0) {
      router.push(`./${candidacies[0].id}`);
    }
  }, [candidacies, candidacyId, router]);

  if (isLoading || (!candidacyId && candidacies.length > 0)) {
    return <LoaderWithLayout />;
  }

  if (candidacies.length === 0) {
    return <div>No candidacies</div>;
  }

  return children;
};
