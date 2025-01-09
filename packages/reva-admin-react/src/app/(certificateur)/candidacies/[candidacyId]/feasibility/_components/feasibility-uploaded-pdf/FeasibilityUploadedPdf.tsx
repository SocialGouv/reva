import { BackButton } from "@/components/back-button/BackButton";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { FancyPreview } from "@/components/fancy-preview/FancyPreview";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { errorToast } from "@/components/toast/toast";
import Alert from "@codegouvfr/react-dsfr/Alert";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { useRouter } from "next/navigation";
import { FeasibilityBanner } from "../FeasibilityBanner";
import {
  FeasibilityCompletionForm,
  FeasibilityCompletionFormData,
} from "../FeasibilityCompletionForm";
import {
  FeasibilityValidationForm,
  FeasibilityValidationFormData,
} from "../FeasibilityValidationForm";
import { useFeasibilityUploadedPdf } from "./feasibilityUploadedPdf.hook";

export const FeasibilityUploadedPdf = () => {
  const { candidacy, feasibility, submitFeasibilityDecision } =
    useFeasibilityUploadedPdf();
  const router = useRouter();
  const { isFeatureActive } = useFeatureflipping();

  const handleCompletionFormSubmit = async (
    data: FeasibilityCompletionFormData,
  ) => {
    const result = await submitFeasibilityDecision({
      decision: data.decision,
      comment: data.comment,
    });
    if (result.ok) {
      router.push("/candidacies/feasibilities");
    } else {
      errorToast(await result.text());
    }
  };

  const handleValidationFormSubmit = async (
    data: FeasibilityValidationFormData,
  ) => {
    const result = await submitFeasibilityDecision({
      decision: data.decision,
      comment: data.comment,
      infoFile: data.infoFile?.[0],
    });
    if (result.ok) {
      router.push("/candidacies/feasibilities");
    } else {
      errorToast(await result.text());
    }
  };

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

  const uploadedPdf = feasibility?.feasibilityUploadedPdf;
  const feasibilityFile = uploadedPdf?.feasibilityFile;
  const IDFile = uploadedPdf?.IDFile;
  const documentaryProofFile = uploadedPdf?.documentaryProofFile;
  const certificateOfAttendanceFile = uploadedPdf?.certificateOfAttendanceFile;

  const pendingCaduciteContestation =
    candidacy?.candidacyContestationsCaducite?.find(
      (candidacyContestation) =>
        candidacyContestation?.certificationAuthorityContestationDecision ===
        "DECISION_PENDING",
    );

  const isCandidacyActualisationFeatureActive = isFeatureActive(
    "candidacy_actualisation",
  );

  return (
    <div className="flex flex-col flex-1 mb-2 w-full">
      <BackButton href="/candidacies/feasibilities">
        Tous les dossiers
      </BackButton>
      {feasibility && candidacy && (
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="mb-12">Dossier de faisabilité</h1>
            <FeasibilityBanner
              decision={feasibility.decision}
              decisionComment={feasibility.decisionComment}
              decisionSentAt={feasibility.decisionSentAt}
              feasibilityHistory={feasibility.history}
              isCaduque={candidacy.isCaduque}
              lastActivityDate={candidacy.lastActivityDate}
              candidacyId={candidacy.id}
              hasPendingCaduciteContestation={!!pendingCaduciteContestation}
              isCandidacyActualisationFeatureActive={
                isCandidacyActualisationFeatureActive
              }
              pendingCaduciteContestationSentAt={
                pendingCaduciteContestation?.contestationSentAt
              }
            />
            <h2 className="mb-6 mt-12">Certification visée</h2>
            <p className="text-lg font-bold mb-0">
              {candidacy.certification?.label}
            </p>
          </div>
          <div>
            {feasibilityFile?.previewUrl && (
              <FancyPreview
                src={feasibilityFile.previewUrl}
                name={feasibilityFile.name}
                title="Dossier de faisabilite"
                defaultDisplay={false}
              />
            )}

            {IDFile?.previewUrl && (
              <FancyPreview
                src={IDFile.previewUrl}
                name={IDFile.name}
                title="Pièce d'identité"
                defaultDisplay={false}
              />
            )}

            {documentaryProofFile?.previewUrl && (
              <FancyPreview
                src={documentaryProofFile.previewUrl}
                name={documentaryProofFile.name}
                title="Justificatifs"
                defaultDisplay={false}
              />
            )}

            {certificateOfAttendanceFile?.previewUrl && (
              <FancyPreview
                src={certificateOfAttendanceFile.previewUrl}
                name={certificateOfAttendanceFile.name}
                title="Attestation ou certificat de suivi de formation"
                defaultDisplay={false}
              />
            )}
            <Alert
              className="mt-4"
              severity="warning"
              title="Qu’arrive-t-il au document d’identité après la décision du certificateur ?"
              description="Pour des raisons de protection des données personnelles, nous effaçons le document de nos serveurs  lorsque la décision concernant la recevabilité (recevable, non recevable ou incomplet) est prononcée."
            />
          </div>

          {candidacy.typeAccompagnement === "ACCOMPAGNE" && (
            <GrayCard>
              <h5 className="text-2xl font-bold mb-4">
                Architecte Accompagnateur de Parcours
              </h5>
              <h6 className="text-xl font-bold mb-4">
                {candidacy.organism?.label}
              </h6>
              <p className="text-lg mb-0">
                {candidacy.organism?.contactAdministrativeEmail}
              </p>
            </GrayCard>
          )}

          {candidacy.typeAccompagnement === "AUTONOME" && (
            <CallOut>
              <h5 className="text-2xl font-bold mb-4">
                Contact du candidat :{" "}
              </h5>
              <p className="text-lg mb-0">
                {candidacy.candidate?.firstname} {candidacy.candidate?.lastname}
              </p>
              <p className="text-lg mb-0">{candidacy.candidate?.phone}</p>
              <p className="text-lg mb-0">{candidacy.candidate?.email}</p>
            </CallOut>
          )}

          {waitingForDecision && (
            <>
              <hr className="mt-2 mb-3 pb-1" />
              {isFeasibilityWaitingToBeMarkedAsComplete && (
                <FeasibilityCompletionForm
                  onSubmit={handleCompletionFormSubmit}
                />
              )}
              {isFeasibilityWaitingToBeValidated && (
                <FeasibilityValidationForm
                  onSubmit={handleValidationFormSubmit}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
