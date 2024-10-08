"use client";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import {
  Candidacy,
  DematerializedFeasibilityFile,
} from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import DffSummary from "../_components/DffSummary/DffSummary";
import { useSendFileCandidate } from "./_components/sendFileCandidate.hook";

const HasBeenSentComponent = ({
  sentToCandidateAt,
}: {
  sentToCandidateAt: Date;
}) => (
  <>
    {sentToCandidateAt ? (
      <Alert
        description={`Dossier envoyé au candidat le ${format(sentToCandidateAt, "dd/MM/yyyy")}`}
        severity="success"
        title=""
        className="mb-12"
      />
    ) : (
      <p className="text-xl mb-12" data-html2canvas-ignore="true">
        Vérifiez que toutes les informations soient correctes et envoyez le
        dossier de faisabilité au candidat. Il devra vous fournir une
        attestation sur l'honneur pour valider ce dossier.
      </p>
    )}
  </>
);

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

  return (
    <>
      <DffSummary
        dematerializedFeasibilityFile={
          dematerializedFeasibilityFile as DematerializedFeasibilityFile
        }
        candidacy={candidacy as Candidacy}
        HasBeenSentComponent={
          <HasBeenSentComponent
            sentToCandidateAt={
              dematerializedFeasibilityFile?.sentToCandidateAt as any as Date
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
