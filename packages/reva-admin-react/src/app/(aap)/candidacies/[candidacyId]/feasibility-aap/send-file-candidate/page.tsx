"use client";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import Button from "@codegouvfr/react-dsfr/Button";
import { useParams, useRouter } from "next/navigation";
import DffSummary from "../_components/DffSummary/DffSummary";
import { useSendFileCandidate } from "./_components/sendFileCandidate.hook";

export default function SendFileCandidatePage() {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const { sendToCandidateMutation, dematerializedFeasibilityFileId } =
    useSendFileCandidate();
  const router = useRouter();
  const feasibilitySummaryUrl = `/candidacies/${candidacyId}/feasibility-aap`;

  const handleSendFile = async () => {
    try {
      if (!dematerializedFeasibilityFileId) return;

      await sendToCandidateMutation(dematerializedFeasibilityFileId);
      successToast("Le dossier a été envoyé au candidat");
      router.push(feasibilitySummaryUrl);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <div>
      <DffSummary />

      <div className="flex justify-between">
        <Button
          priority="secondary"
          onClick={() => router.push(feasibilitySummaryUrl)}
        >
          Retour
        </Button>
        <Button onClick={handleSendFile}>Envoyer au candidat</Button>
      </div>
    </div>
  );
}
