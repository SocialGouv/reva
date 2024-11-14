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
import {
  createOrUpdateCertificationAuthorityDecision,
  useDematerializedFeasibility,
} from "./dematerializedFeasibility.hook";
import {
  FeasibilityCompletionForm,
  FeasibilityCompletionFormData,
} from "../FeasibilityCompletionForm";
import {
  FeasibilityValidationForm,
  FeasibilityValidationFormData,
} from "../FeasibilityValidationForm";

export const DematerializedFeasibility = () => {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const { dematerializedFeasibilityFile, candidacy, feasibility } =
    useDematerializedFeasibility();
  const urqlClient = useUrqlClient();
  const queryClient = useQueryClient();

  const isCandidacyArchived = candidacy?.status === "ARCHIVE";

  const isCandidacyDroppedOut = !!candidacy?.candidacyDropOut;

  const isFeasibilityWaitingToBeMarkedAsComplete =
    feasibility?.decision === "PENDING" &&
    !isCandidacyArchived &&
    !isCandidacyDroppedOut;

  const isFeasibilityWaitingToBeValidated =
    feasibility?.decision === "COMPLETE" &&
    !isCandidacyArchived &&
    !isCandidacyDroppedOut;

  const waitingForDecision =
    isFeasibilityWaitingToBeMarkedAsComplete ||
    isFeasibilityWaitingToBeValidated;

  const handleValidationFormSubmit = async (
    data: FeasibilityValidationFormData,
  ) => {
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
      queryClient.invalidateQueries({
        queryKey: ["feasibilities"],
      });
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const handleCompletionFormSubmit = async (
    data: FeasibilityCompletionFormData,
  ) => {
    const input = {
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
      queryClient.invalidateQueries({
        queryKey: ["feasibilities"],
      });
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
          !waitingForDecision && (
            <DecisionSentComponent
              decisionSentAt={
                feasibility?.decisionSentAt
                  ? new Date(feasibility.decisionSentAt)
                  : null
              }
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

      {waitingForDecision && (
        <>
          <hr className="mt-14 mb-8" />
          {isFeasibilityWaitingToBeMarkedAsComplete && (
            <FeasibilityCompletionForm onSubmit={handleCompletionFormSubmit} />
          )}
          {isFeasibilityWaitingToBeValidated && (
            <FeasibilityValidationForm onSubmit={handleValidationFormSubmit} />
          )}
        </>
      )}
    </>
  );
};
