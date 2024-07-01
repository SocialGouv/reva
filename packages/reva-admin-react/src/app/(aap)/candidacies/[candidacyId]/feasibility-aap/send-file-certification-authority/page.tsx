"use client";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { DematerializedFeasibilityFile } from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
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
  } = useSendFileCertificationAuthority();

  const handleSendFile = async () => {
    if (
      !dematerializedFeasibilityFile ||
      !dematerializedFeasibilityFile.candidacy?.certification
        ?.certificationAuthorities[0]
    ) {
      return;
    }

    try {
      await sendToCertificationAuthorityMutation({
        dematerializedFeasibilityFileId: dematerializedFeasibilityFile.id,
        certificationAuthorityId:
          dematerializedFeasibilityFile.candidacy.certification
            .certificationAuthorities[0].id,
      });
      successToast("Le dossier de faisabilité a été envoyé au certificateur");
      router.push(feasibilitySummaryUrl);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <div>
      <DffSummary
        dematerializedFeasibilityFile={
          dematerializedFeasibilityFile as DematerializedFeasibilityFile
        }
        HasBeenSentComponent={
          dematerializedFeasibilityFile?.sentToCertificationAuthorityAt && (
            <HasBeenSentComponent
              sentToCertificationAuthorityAt={
                dematerializedFeasibilityFile?.sentToCertificationAuthorityAt as any as Date
              }
            />
          )
        }
      />
      <CertificationAuthoritySection
        certificationAuthorityLabel={
          dematerializedFeasibilityFile?.candidacy?.certification
            ?.certificationAuthorities[0]?.label
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
            !!dematerializedFeasibilityFile?.sentToCertificationAuthorityAt
          }
        >
          Envoyer au certificateur
        </Button>
      </div>
    </div>
  );
}
