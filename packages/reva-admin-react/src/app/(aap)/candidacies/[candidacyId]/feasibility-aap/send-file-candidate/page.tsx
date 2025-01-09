"use client";
import { BannerIsCaduque } from "@/components/dff-summary/_components/BannerIsCaduque";
import { DffSummary } from "@/components/dff-summary/DffSummary";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import {
  Candidacy,
  DematerializedFeasibilityFile,
} from "@/graphql/generated/graphql";
import { dateThresholdCandidacyIsCaduque } from "@/utils/dateThresholdCandidacyIsCaduque";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useSendFileCandidate } from "./_components/sendFileCandidate.hook";

const FeasibilityBanner = ({
  sentToCandidateAt,
  dateSinceCandidacyIsCaduque,
  isCandidacyActualisationFeatureActive,
}: {
  sentToCandidateAt: Date | null;
  dateSinceCandidacyIsCaduque: Date | null;
  isCandidacyActualisationFeatureActive: boolean;
}) => {
  if (dateSinceCandidacyIsCaduque && isCandidacyActualisationFeatureActive) {
    return (
      <BannerIsCaduque
        dateSinceCandidacyIsCaduque={dateSinceCandidacyIsCaduque}
      />
    );
  }

  if (sentToCandidateAt) {
    return (
      <Alert
        description={`Dossier envoyé au candidat le ${format(sentToCandidateAt, "dd/MM/yyyy")}`}
        severity="success"
        title=""
        className="mb-12"
      />
    );
  }

  return (
    <p className="text-xl mb-12" data-html2canvas-ignore="true">
      Vérifiez que toutes les informations soient correctes et envoyez le
      dossier de faisabilité au candidat. Il devra vous fournir une attestation
      sur l'honneur pour valider ce dossier.
    </p>
  );
};

export default function SendFileCandidatePage() {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const {
    sendToCandidateMutation,
    dematerializedFeasibilityFileId,
    dematerializedFeasibilityFile,
    candidacy,
  } = useSendFileCandidate();
  const router = useRouter();
  const feasibilitySummaryUrl = `/candidacies/${candidacyId}/feasibility-aap`;
  const { isFeatureActive } = useFeatureflipping();
  const isCandidacyActualisationFeatureActive = isFeatureActive(
    "candidacy_actualisation",
  );

  const handleSendFile = async () => {
    try {
      if (!dematerializedFeasibilityFileId) return;

      await sendToCandidateMutation(dematerializedFeasibilityFileId);
      successToast("Le dossier de faisabilité a été envoyé au candidat");
      router.push(feasibilitySummaryUrl);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const sentToCandidateAt = dematerializedFeasibilityFile?.sentToCandidateAt
    ? new Date(dematerializedFeasibilityFile?.sentToCandidateAt)
    : null;
  const dateSinceCandidacyIsCaduque = candidacy?.isCaduque
    ? dateThresholdCandidacyIsCaduque(candidacy.lastActivityDate as number)
    : null;

  return (
    <>
      <DffSummary
        dematerializedFeasibilityFile={
          dematerializedFeasibilityFile as DematerializedFeasibilityFile
        }
        candidacy={candidacy as Candidacy}
        FeasibilityBanner={
          <FeasibilityBanner
            sentToCandidateAt={sentToCandidateAt}
            dateSinceCandidacyIsCaduque={dateSinceCandidacyIsCaduque}
            isCandidacyActualisationFeatureActive={
              isCandidacyActualisationFeatureActive
            }
          />
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
          disabled={!!dematerializedFeasibilityFile?.sentToCandidateAt}
        >
          Envoyer au candidat
        </Button>
      </div>
    </>
  );
}
