import DffSummary from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/_components/DffSummary/DffSummary";
import { DecisionSentComponent } from "@/components/alert-decision-sent-feasibility/DecisionSentComponent";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useUrqlClient } from "@/components/urql-client";
import {
  Candidacy,
  DematerializedFeasibilityFile,
  FeasibilityDecision,
} from "@/graphql/generated/graphql";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  createOrUpdateCertificationAuthorityDecision,
  useDematerializedFeasibility,
} from "./dematerializedFeasibility.hook";
import { FeasibilityForm, FeasibilityFormData } from "../FeasibilityForm";

export const DematerializedFeasibility = () => {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const { dematerializedFeasibilityFile, candidacy, feasibility } =
    useDematerializedFeasibility();
  const urqlClient = useUrqlClient();
  const decisionHasBeenMade = feasibility?.decision !== "PENDING";
  const queryClient = useQueryClient();

  const defaultValues = useMemo(
    () => ({
      decision: undefined,
      decisionComment: undefined,
      decisionFile: undefined,
    }),
    [],
  );

  const handleFormSubmit = async (data: FeasibilityFormData) => {
    const decisionFile = data.infoFile?.[0];
    const input = {
      decisionFile,
      decision: data.decision,
      decisionComment: data.comment,
    };

    try {
      const result = await urqlClient.mutation(
        createOrUpdateCertificationAuthorityDecision,
        {
          input,
          candidacyId,
        },
      );
      if (result?.error) {
        throw new Error(result?.error?.graphQLErrors[0].message);
      }
      successToast("Décision du dossier de faisabilité envoyée avec succès");
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  if (!candidacy || !dematerializedFeasibilityFile) return null;

  const organism = candidacy.organism;

  return (
    <>
      <DffSummary
        dematerializedFeasibilityFile={
          dematerializedFeasibilityFile as DematerializedFeasibilityFile
        }
        candidacy={candidacy as Candidacy}
        HasBeenSentComponent={
          decisionHasBeenMade && (
            <DecisionSentComponent
              decisionSentAt={feasibility?.decisionSentAt as any as Date}
              decision={feasibility?.decision as FeasibilityDecision}
              decisionComment={feasibility?.decisionComment}
              history={feasibility?.history}
            />
          )
        }
        displayGiveYourDecisionSubtitle
      />

      {organism && (
        <CallOut title="Architecte accompagnateur de parcours en charge du dossier :">
          <div className="my-4 flex flex-col">
            <span>{organism.label}</span>
            <span>
              {organism.informationsCommerciales?.adresseCodePostal}{" "}
              {organism.informationsCommerciales?.adresseVille}
            </span>
            <span>{organism.informationsCommerciales?.telephone}</span>
            <span>{organism.informationsCommerciales?.emailContact}</span>
          </div>
        </CallOut>
      )}

      {!decisionHasBeenMade && (
        <>
          <hr className="mt-12 mb-11 pb-1" />
          <FeasibilityForm onSubmit={handleFormSubmit} />
        </>
      )}
    </>
  );
};
