import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import {
  CandidacyForCandidaciesGuard,
  useCandidaciesGuard,
} from "./CandidaciesGuard.hook";

export const CandidaciesGuard = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { candidate, isLoading } = useCandidaciesGuard();

  const router = useRouter();

  const candidacies = useMemo(() => candidate?.candidacies || [], [candidate]);

  const { isFeatureActive } = useFeatureFlipping();
  const isMultiCandidacyFeatureActive = isFeatureActive("MULTI_CANDIDACY");

  useEffect(() => {
    if (isMultiCandidacyFeatureActive) {
      return;
    }

    if (candidacies.length > 0) {
      router.push(`./${candidacies[0].id}`);
    }
  }, [candidacies, isMultiCandidacyFeatureActive, router]);

  if (isMultiCandidacyFeatureActive) {
    return <SelectCandidacy candidacies={candidacies} />;
  }

  if (!isMultiCandidacyFeatureActive) {
    if (isLoading || candidacies.length > 0) {
      return <LoaderWithLayout />;
    }

    if (candidacies.length === 0) {
      return <div>No candidacies</div>;
    }
  }

  return children;
};

const SelectCandidacy = ({
  candidacies,
}: {
  candidacies: CandidacyForCandidaciesGuard[];
}) => {
  const router = useRouter();

  if (candidacies.length === 0) {
    return <div>No candidacies</div>;
  }

  return (
    <div>
      <h1>Sélectionner une candidature</h1>

      {candidacies.map((candidacy) => (
        <div key={candidacy.id} className="flex flex-col">
          <div
            className="flex flex-row gap-2 cursor-pointer"
            onClick={() => {
              router.push(`./${candidacy.id}`);
            }}
          >
            <div className="text-sm font-bold">
              {candidacy.certification?.codeRncp}
            </div>
            <div className="text-sm font-bold">
              {candidacy.certification?.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
