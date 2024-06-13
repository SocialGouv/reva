"use client";

import { useParams } from "next/navigation";

import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";

import { useHooks } from "./page.hooks";
import { SendFeasibilityForm } from "./_components/SendFeasibilityForm";
import { FeasibiltyStatus } from "./_components/FeasibiltyStatus";

const AapFeasibilityPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { candidacy } = useHooks(candidacyId);

  const candidate = candidacy.data?.getCandidacyById?.candidate;
  const certification = candidacy.data?.getCandidacyById?.certification;
  const feasibility = candidacy.data?.getCandidacyById?.feasibility;

  const isLoading = candidacy.isFetching || candidacy.isPending;

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

          {!feasibility ||
            (feasibility.decision == "INCOMPLETE" && (
              <SendFeasibilityForm candidacyId={candidacyId} />
            ))}

          {feasibility && feasibility.decision != "INCOMPLETE" && (
            <FeasibiltyStatus candidacyId={candidacyId} />
          )}
        </>
      )}
    </div>
  );
};

export default AapFeasibilityPage;
