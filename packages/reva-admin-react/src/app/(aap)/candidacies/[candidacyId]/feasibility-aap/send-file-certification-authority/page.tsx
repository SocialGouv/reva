"use client";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import Button from "@codegouvfr/react-dsfr/Button";
import { useParams, useRouter } from "next/navigation";
import DffSummary from "../_components/DffSummary/DffSummary";

export default function SendFileCertificationAuthorityPage() {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const router = useRouter();
  const feasibilitySummaryUrl = `/candidacies/${candidacyId}/feasibility-aap`;

  const handleSendFile = async () => {
    try {
      successToast("Avis enregistré");
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
        <Button onClick={handleSendFile}>Envoyer au certificateur</Button>
      </div>
    </div>
  );
}
