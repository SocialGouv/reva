"use client";

import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format, toDate } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DecisionSentComponent } from "@/components/alert-decision-sent-feasibility/DecisionSentComponent";
import { DffSummary } from "@/components/dff-summary/DffSummary";
import {
  errorToast,
  graphqlErrorToast,
  successToast,
} from "@/components/toast/toast";

import {
  Candidacy,
  DematerializedFeasibilityFile,
  FeasibilityDecision,
} from "@/graphql/generated/graphql";

import CertificationAuthoritySection from "./_components/CertificationAuthoritySection";
import { useSendFileCertificationAuthority } from "./_components/sendFileCertificationAuthority.hook";

const HasBeenSentComponent = ({
  sentToCertificationAuthorityAt,
}: {
  sentToCertificationAuthorityAt: Date;
}) => (
  <Alert
    description={`Dossier envoyé au certificateur le ${format(sentToCertificationAuthorityAt, "dd/MM/yyyy")}`}
    severity="success"
    title=""
    className="mb-12"
  />
);

const FeasibilityBanner = ({
  feasibilityFileSentAt,
  feasibilityIsPending,
  decisionSentAt,
  decision,
  decisionComment,
}: {
  feasibilityFileSentAt?: number | null;
  feasibilityIsPending: boolean;
  decisionSentAt?: number | null;
  decision: FeasibilityDecision;
  decisionComment?: string | null;
}) => {
  if (feasibilityFileSentAt) {
    if (feasibilityIsPending) {
      return (
        <HasBeenSentComponent
          sentToCertificationAuthorityAt={toDate(feasibilityFileSentAt)}
        />
      );
    } else {
      return (
        <DecisionSentComponent
          decisionSentAt={decisionSentAt ? toDate(decisionSentAt) : null}
          decision={decision as FeasibilityDecision}
          decisionComment={decisionComment}
        />
      );
    }
  }

  return null;
};

export default function SendFileCertificationAuthorityPage() {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const router = useRouter();
  const feasibilitySummaryUrl = `/candidacies/${candidacyId}/feasibility-aap`;

  const {
    dematerializedFeasibilityFile,
    sendToCertificationAuthorityMutation,
    candidacy,
    feasibility,
  } = useSendFileCertificationAuthority();

  const certificationAuthorities = useMemo(() => {
    if (!candidacy?.certificationAuthorities) {
      return [];
    }
    return candidacy.certificationAuthorities;
  }, [candidacy?.certificationAuthorities]);

  const [
    certificationAuthoritySelectedId,
    setCertificationAuthoritySelectedId,
  ] = useState<string>("");

  const [
    certificationAuthoritySelectError,
    setCertificationAuthoritySelectError,
  ] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const decision = feasibility?.decision;
  const decisionSentAt = feasibility?.decisionSentAt;
  const decisionComment = feasibility?.decisionComment;
  const feasibilityFileSentAt = feasibility?.feasibilityFileSentAt;
  const feasibilityIsPending = decision === "PENDING";
  const feasibilityIsIncomplete = decision === "INCOMPLETE";
  const feasibilityHasBeenSent = !!feasibilityFileSentAt;
  const feasibilityFileNeedsNewOrResendAction =
    !feasibilityHasBeenSent || feasibilityIsIncomplete;
  const isReadyToBeSentToCertificationAuthority =
    dematerializedFeasibilityFile?.isReadyToBeSentToCertificationAuthority;

  const handleSendFile = async () => {
    if (!dematerializedFeasibilityFile) {
      return;
    }

    if (!certificationAuthoritySelectedId) {
      setCertificationAuthoritySelectError(true);
      errorToast(
        "Impossible d'envoyer le dossier. Merci de sélectionner un certificateur",
      );
      return;
    } else {
      setCertificationAuthoritySelectError(false);
    }

    try {
      setIsSubmitting(true);
      await sendToCertificationAuthorityMutation({
        dematerializedFeasibilityFileId: dematerializedFeasibilityFile.id,
        certificationAuthorityId: certificationAuthoritySelectedId,
      });
      successToast("Le dossier de faisabilité a été envoyé au certificateur");
      router.push(feasibilitySummaryUrl);
    } catch (error) {
      graphqlErrorToast(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      !certificationAuthoritySelectedId &&
      certificationAuthorities.length === 1
    ) {
      setCertificationAuthoritySelectedId(certificationAuthorities[0].id);
    }
  }, [certificationAuthorities, certificationAuthoritySelectedId]);

  return (
    <div>
      <DffSummary
        dematerializedFeasibilityFile={
          dematerializedFeasibilityFile as DematerializedFeasibilityFile
        }
        candidacy={candidacy as Candidacy}
        FeasibilityBanner={
          <FeasibilityBanner
            feasibilityFileSentAt={feasibilityFileSentAt}
            feasibilityIsPending={feasibilityIsPending}
            decisionSentAt={decisionSentAt}
            decision={decision as FeasibilityDecision}
            decisionComment={decisionComment}
          />
        }
        certificationAuthorityStructureLabel={
          candidacy?.certification?.certificationAuthorityStructure?.label
        }
      />
      <CertificationAuthoritySection
        certificationAuthorities={certificationAuthorities}
        certificationAuthoritySelectedId={certificationAuthoritySelectedId}
        certificationAuthoritySelectError={certificationAuthoritySelectError}
        setCertificationAuthoritySelectedId={
          setCertificationAuthoritySelectedId
        }
        feasibilityHasBeenSentToCertificationAuthority={!!feasibilityFileSentAt}
      />

      <div className="flex justify-between">
        <Button
          priority="secondary"
          onClick={() => router.push(feasibilitySummaryUrl)}
        >
          Retour
        </Button>
        <Button
          onClick={handleSendFile}
          disabled={
            !feasibilityFileNeedsNewOrResendAction ||
            !isReadyToBeSentToCertificationAuthority ||
            isSubmitting
          }
        >
          Envoyer au certificateur
        </Button>
      </div>
    </div>
  );
}
