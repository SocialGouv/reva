import { ContactInfosSection } from "@/app/contact-infos-section/ContactInfosSection";
import { DecisionSentComponent } from "@/components/alert-decision-sent-feasibility/DecisionSentComponent";
import { BannerCaduciteConfirmed } from "@/components/dff-summary/_components/BannerCaduciteConfirmed";
import { BannerIsCaduque } from "@/components/dff-summary/_components/BannerIsCaduque";
import { DffSummary } from "@/components/dff-summary/DffSummary";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useUrqlClient } from "@/components/urql-client";
import {
  Candidacy,
  DematerializedFeasibilityFile,
  FeasibilityDecision,
  FeasibilityHistory,
} from "@/graphql/generated/graphql";
import { dateThresholdCandidacyIsCaduque } from "@/utils/dateThresholdCandidacyIsCaduque";
import { useAuth } from "@/components/auth/auth";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQueryClient } from "@tanstack/react-query";
import { format, toDate } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FeasibilityCompletionForm,
  FeasibilityCompletionFormData,
} from "../FeasibilityCompletionForm";
import {
  FeasibilityValidationForm,
  FeasibilityValidationFormData,
} from "../FeasibilityValidationForm";
import { useRevokeFeasibilityDecisionModal } from "../useRevokeFeasibilityDecisionModal.hook";
import {
  createOrUpdateCertificationAuthorityDecision,
  useDematerializedFeasibility,
} from "./dematerializedFeasibility.hook";

const FeasibilityBanner = ({
  isWaitingForDecision,
  feasibilityDecisionSentAt,
  feasibilityDecision,
  feasibilityDecisionComment,
  feasibilityHistory,
  dateSinceCandidacyIsCaduque,
  pendingCaduciteContestationSentAt,
  candidacyId,
  isCandidacyActualisationFeatureActive,
  hasConfirmedCaduciteContestation,
  onRevokeDecision,
  isAdmin,
  candidacyStatus,
}: {
  isWaitingForDecision: boolean;
  feasibilityDecisionSentAt: Date | null;
  feasibilityDecision: FeasibilityDecision;
  feasibilityDecisionComment?: string | null;
  feasibilityHistory: FeasibilityHistory[];
  dateSinceCandidacyIsCaduque: Date | null;
  pendingCaduciteContestationSentAt: number | null;
  candidacyId: string;
  isCandidacyActualisationFeatureActive: boolean;
  hasConfirmedCaduciteContestation: boolean;
  onRevokeDecision?: () => void;
  isAdmin?: boolean;
  candidacyStatus: string;
}) => {
  if (
    hasConfirmedCaduciteContestation &&
    isCandidacyActualisationFeatureActive &&
    dateSinceCandidacyIsCaduque
  ) {
    return (
      <BannerCaduciteConfirmed
        dateSinceCandidacyIsCaduque={dateSinceCandidacyIsCaduque}
      />
    );
  }

  if (
    pendingCaduciteContestationSentAt &&
    isCandidacyActualisationFeatureActive
  ) {
    return (
      <div
        className="flex flex-col mb-6"
        data-test="banner-pending-caducite-contestation"
      >
        <Alert
          className="mb-4"
          severity="warning"
          title={`Contestation envoyée le ${format(
            pendingCaduciteContestationSentAt,
            "dd/MM/yyyy",
          )}`}
          description="Le candidat conteste la caducité de sa recevabilité. Consultez les raisons transmises par le candidat et décidez si, oui ou non, vous souhaitez restaurer la recevabilité."
        />
        <Link
          href={`/candidacies/${candidacyId}/feasibility/caducite-contestation`}
          className="self-end "
        >
          <Button>Consulter</Button>
        </Link>
      </div>
    );
  }

  if (dateSinceCandidacyIsCaduque && isCandidacyActualisationFeatureActive) {
    return (
      <BannerIsCaduque
        dateSinceCandidacyIsCaduque={dateSinceCandidacyIsCaduque}
      />
    );
  }

  if (!isWaitingForDecision) {
    return (
      <DecisionSentComponent
        decisionSentAt={feasibilityDecisionSentAt}
        decision={feasibilityDecision}
        decisionComment={feasibilityDecisionComment}
        history={feasibilityHistory}
        onRevokeDecision={onRevokeDecision}
        isAdmin={isAdmin}
        candidacyStatus={candidacyStatus}
      />
    );
  }

  return null;
};

export const DematerializedFeasibility = () => {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const {
    dematerializedFeasibilityFile,
    candidacy,
    feasibility,
    revokeDecision,
  } = useDematerializedFeasibility();
  const { isFeatureActive } = useFeatureflipping();
  const isCandidacyActualisationFeatureActive = isFeatureActive(
    "candidacy_actualisation",
  );
  const urqlClient = useUrqlClient();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const revokeDecisionModal = useRevokeFeasibilityDecisionModal();

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

  if (!candidacy || !dematerializedFeasibilityFile || !feasibility) return null;

  const organism = candidacy.organism;

  const feasibilityDecisionSentAt = feasibility?.decisionSentAt
    ? toDate(feasibility.decisionSentAt)
    : null;

  const dateSinceCandidacyIsCaduque = candidacy.isCaduque
    ? dateThresholdCandidacyIsCaduque(candidacy.lastActivityDate as number)
    : null;

  const pendingCaduciteContestation =
    candidacy?.candidacyContestationsCaducite?.find(
      (candidacyContestation) =>
        candidacyContestation?.certificationAuthorityContestationDecision ===
        "DECISION_PENDING",
    );

  const hasConfirmedCaduciteContestation =
    !!candidacy?.candidacyContestationsCaducite?.find(
      (candidacyContestation) =>
        candidacyContestation?.certificationAuthorityContestationDecision ===
        "CADUCITE_CONFIRMED",
    );

  const pendingCaduciteContestationSentAt = pendingCaduciteContestation
    ? pendingCaduciteContestation.contestationSentAt
    : null;

  const candidateName = `${candidacy.candidate?.firstname ?? ""} ${candidacy.candidate?.lastname ?? ""}`;
  const certificationName = candidacy.certification?.label ?? "";

  return (
    <div
      data-test={`feasibility-page-dematerialized-${feasibility?.decision?.toLowerCase() || "pending"}`}
    >
      <revokeDecisionModal.Component
        onConfirmButtonClick={async (data: { reason: string }) => {
          try {
            await revokeDecision.mutateAsync({
              feasibilityId: feasibility.id,
              reason: data.reason,
            });
            queryClient.invalidateQueries({ queryKey: [candidacyId] });
          } catch (e) {
            graphqlErrorToast(e);
          }
        }}
      />
      <DffSummary
        dematerializedFeasibilityFile={
          dematerializedFeasibilityFile as DematerializedFeasibilityFile
        }
        candidacy={candidacy as Candidacy}
        FeasibilityBanner={
          <FeasibilityBanner
            isWaitingForDecision={waitingForDecision}
            feasibilityDecisionSentAt={feasibilityDecisionSentAt}
            feasibilityDecision={feasibility?.decision as FeasibilityDecision}
            feasibilityDecisionComment={feasibility?.decisionComment}
            feasibilityHistory={feasibility?.history as FeasibilityHistory[]}
            dateSinceCandidacyIsCaduque={dateSinceCandidacyIsCaduque}
            pendingCaduciteContestationSentAt={
              pendingCaduciteContestationSentAt
            }
            candidacyId={candidacyId}
            isCandidacyActualisationFeatureActive={
              isCandidacyActualisationFeatureActive
            }
            hasConfirmedCaduciteContestation={hasConfirmedCaduciteContestation}
            onRevokeDecision={() => revokeDecisionModal.open()}
            isAdmin={isAdmin}
            candidacyStatus={candidacy.status}
          />
        }
        displayGiveYourDecisionSubtitle
      />

      {(feasibility?.certificationAuthority || organism) && (
        <ContactInfosSection
          certificationAuthority={feasibility?.certificationAuthority}
          certificationAuthorityLocalAccounts={
            candidacy.certificationAuthorityLocalAccounts
          }
          organism={organism}
        />
      )}

      {waitingForDecision && (
        <>
          <hr className="mt-14 mb-8" />
          {isFeasibilityWaitingToBeMarkedAsComplete && (
            <FeasibilityCompletionForm onSubmit={handleCompletionFormSubmit} />
          )}
          {isFeasibilityWaitingToBeValidated && (
            <FeasibilityValidationForm
              onSubmit={handleValidationFormSubmit}
              candidateName={candidateName}
              certificationName={certificationName}
            />
          )}
        </>
      )}
    </div>
  );
};
