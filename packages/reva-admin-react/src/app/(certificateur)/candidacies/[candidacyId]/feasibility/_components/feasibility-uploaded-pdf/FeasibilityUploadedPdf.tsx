import { AuthenticatedLink } from "@/components/authenticated-link/AuthenticatedLink";
import { BackButton } from "@/components/back-button/BackButton";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import {
  FeasibilityDecisionHistory,
  FeasibilityDecisionInfo,
} from "@/components/feasibility-decison-history";
import { errorToast } from "@/components/toast/toast";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useRouter } from "next/navigation";
import { FeasibilityForm, FeasibilityFormData } from "../FeasibilityForm";
import { useFeasibilityUploadedPdf } from "./feasibilityUploadedPdf.hook";

const FileLink = ({ url, text }: { url: string; text: string }) => (
  <AuthenticatedLink
    text={text}
    title={text}
    url={url}
    className="fr-link fr-icon-download-line fr-link--icon-right text-blue-900 text-lg mr-auto break-words"
  />
);

export const FeasibilityUploadedPdf = () => {
  const { candidacy, feasibility, submitFeasibilityDecision } =
    useFeasibilityUploadedPdf();
  const router = useRouter();
  const handleFormSubmit = async (data: FeasibilityFormData) => {
    const result = await submitFeasibilityDecision({
      decision: data.decision,
      comment: data.comment,
      infoFile: data?.infoFile?.[0],
    });
    if (result.ok) {
      router.push("/candidacies/feasibilities");
    } else {
      errorToast(await result.text());
    }
  };

  const isCandidacyArchived = candidacy?.status === "ARCHIVE";

  const isCandidacyDroppedOut = !!candidacy?.candidacyDropOut;

  const isFeasibilityEditable =
    feasibility?.decision === "PENDING" &&
    !isCandidacyArchived &&
    !isCandidacyDroppedOut;

  const uploadedPdf = feasibility?.feasibilityUploadedPdf;
  const feasibilityFile = uploadedPdf?.feasibilityFile;
  const IDFile = uploadedPdf?.IDFile;
  const documentaryProofFile = uploadedPdf?.documentaryProofFile;
  const certificateOfAttendanceFile = uploadedPdf?.certificateOfAttendanceFile;

  return (
    <div className="flex flex-col flex-1 mb-2 w-full">
      <BackButton href="/candidacies/feasibilities">
        Tous les dossiers
      </BackButton>
      {feasibility && candidacy && (
        <div className="flex flex-col gap-8">
          <div>
            <h1>
              {candidacy.candidate?.firstname} {candidacy.candidate?.lastname}
            </h1>
            <p className="text-2xl font-bold mb-0">
              {candidacy.certification?.label}
            </p>
          </div>

          {feasibilityFile && (
            <GrayCard>
              <h6 className="mb-1">Dossier de faisabilité</h6>
              <FileLink url={feasibilityFile.url} text={feasibilityFile.name} />
            </GrayCard>
          )}

          {IDFile && (
            <GrayCard>
              <h6 className="mb-1">Pièce d'identité</h6>
              <FileLink url={IDFile.url} text={IDFile.name} />
              <Alert
                className="mt-4"
                title="Attention"
                description="La pièce d’identité du candidat sera effacée de nos serveurs lorsque la recevabilité sera prononcée (recevable, non recevable ou incomplet)."
                severity="warning"
              />
            </GrayCard>
          )}

          {documentaryProofFile && (
            <GrayCard>
              <h6 className="mb-1">Justificatif(s)</h6>
              <FileLink
                url={documentaryProofFile.url}
                text={documentaryProofFile.name}
              />
            </GrayCard>
          )}

          {certificateOfAttendanceFile && (
            <GrayCard>
              <h6 className="mb-1">
                Attestation ou certificat de suivi de formation
              </h6>
              <FileLink
                url={certificateOfAttendanceFile.url}
                text={certificateOfAttendanceFile.name}
              />
            </GrayCard>
          )}

          {candidacy.typeAccompagnement === "ACCOMPAGNE" ? (
            <GrayCard>
              <h5 className="text-2xl font-bold mb-4">
                Architecte accompagnateur de parcours
              </h5>
              <h6 className="text-xl font-bold mb-4">
                {candidacy.organism?.label}
              </h6>
              <p className="text-lg mb-0">
                {candidacy.organism?.contactAdministrativeEmail}
              </p>
            </GrayCard>
          ) : (
            <Alert severity="info" title="Candidat en autonomie" />
          )}

          {!isFeasibilityEditable && (
            <div>
              <h5 className="text-2xl font-bold mb-2">
                Décision prise concernant ce dossier
              </h5>
              <FeasibilityDecisionInfo
                id={feasibility.id}
                decision={feasibility.decision}
                decisionSentAt={feasibility.decisionSentAt}
                decisionComment={feasibility.decisionComment}
              />
            </div>
          )}

          {feasibility.history.length > 0 && (
            <FeasibilityDecisionHistory history={feasibility.history} />
          )}
          {isFeasibilityEditable && (
            <FeasibilityForm className="mt-4" onSubmit={handleFormSubmit} />
          )}
        </div>
      )}
    </div>
  );
};
