"use client";

import { useParams } from "next/navigation";

import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";

import { useAapFeasibility } from "./AapFeasibilityPage.hooks";
import { FeasibiltyStatus } from "./_components/FeasibiltyStatus";
import { SendFeasibilityForm } from "./_components/SendFeasibilityForm";

const AapFeasibilityPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { candidacy } = useAapFeasibility(candidacyId);

  const candidate = candidacy.data?.getCandidacyById?.candidate;
  const certification = candidacy.data?.getCandidacyById?.certification;
  const feasibility = candidacy.data?.getCandidacyById?.feasibility;

  const isLoading = candidacy.isFetching || candidacy.isPending;
  const mustSendFeasibility =
    !feasibility ||
    feasibility.decision == "INCOMPLETE" ||
    feasibility.decision == "DRAFT";

  return (
    <div className="flex flex-col gap-6">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1 className="mb-0">Dossier de faisabilité</h1>

      {!isLoading && (
        <>
          <div>
            <h2 className="mb-0">{`${candidate?.firstname} ${candidate?.lastname}`}</h2>
            <h3 className="mb-0 text-xl font-normal">{certification?.label}</h3>
          </div>

          {mustSendFeasibility ? (
            <SendFeasibilityForm candidacyId={candidacyId} />
          ) : (
            <FeasibiltyStatus candidacyId={candidacyId} />
          )}
        </>
      )}
    </div>
  );
};

export default AapFeasibilityPage;
