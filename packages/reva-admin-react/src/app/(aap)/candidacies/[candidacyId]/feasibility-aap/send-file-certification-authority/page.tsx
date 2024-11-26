"use client";
import { DecisionSentComponent } from "@/components/alert-decision-sent-feasibility/DecisionSentComponent";
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
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DffSummary from "../_components/DffSummary/DffSummary";
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
    if (!candidacy?.certification?.certificationAuthorities) {
      return [];
    }
    return candidacy.certification.certificationAuthorities;
  }, [candidacy?.certification?.certificationAuthorities]);

  const [
    certificationAuthoritySelectedId,
    setCertificationAuthoritySelectedId,
  ] = useState<string>("");

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
      errorToast("Veuillez sélectionner un certificateur");
      return;
    }

    try {
      await sendToCertificationAuthorityMutation({
        dematerializedFeasibilityFileId: dematerializedFeasibilityFile.id,
        certificationAuthorityId: certificationAuthoritySelectedId,
      });
      successToast("Le dossier de faisabilité a été envoyé au certificateur");
      router.push(feasibilitySummaryUrl);
    } catch (error) {
      graphqlErrorToast(error);
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
        HasBeenSentComponent={
          feasibilityFileSentAt ? (
            feasibilityIsPending ? (
              <HasBeenSentComponent
                sentToCertificationAuthorityAt={new Date(feasibilityFileSentAt)}
              />
            ) : (
              <DecisionSentComponent
                decisionSentAt={
                  decisionSentAt ? new Date(decisionSentAt) : null
                }
                decision={decision as FeasibilityDecision}
                decisionComment={decisionComment}
              />
            )
          ) : null
        }
      />
      <CertificationAuthoritySection
        certificationAuthorities={certificationAuthorities}
        certificationAuthoritySelectedId={certificationAuthoritySelectedId}
        setCertificationAuthoritySelectedId={
          setCertificationAuthoritySelectedId
        }
        feasibilitySentToCertificationAuthorityLabel={
          feasibility?.certificationAuthority?.label
        }
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
            !isReadyToBeSentToCertificationAuthority
          }
        >
          Envoyer au certificateur
        </Button>
      </div>
    </div>
  );
}
