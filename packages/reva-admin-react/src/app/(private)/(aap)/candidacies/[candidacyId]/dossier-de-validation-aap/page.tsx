"use client";

import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useParams, useRouter } from "next/navigation";

import { Skeleton } from "@/components/aap-candidacy-layout/Skeleton";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import {
  errorToast,
  graphqlErrorToast,
  successToast,
} from "@/components/toast/toast";

import {
  DossierDeValidationFormData,
  DossierDeValidationTab,
} from "./_components/DossierDeValidationTab";
import { ReadOnlyDossierDeValidationView } from "./_components/ReadOnlyDossierDeValidationView";
import {
  ReadyForJuryEstimatedAtSchemaFormData,
  ReadyForJuryEstimatedDateTab,
} from "./_components/ReadyForJuryEstimatedDateTab";
import { useAapDossierDeValidationPage } from "./aapDossierDeValidation.hooks";

const AapDossierDeValidationPage = () => {
  const router = useRouter();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const {
    candidacy,
    dossierDeValidation,
    historyDossierDeValidation,
    getCandidacyStatus,
    setReadyForJuryEstimatedAt,
    sendDossierDeValidation,
  } = useAapDossierDeValidationPage();

  const handleReadyForJuryEstimatedAtFormSubmit = async ({
    readyForJuryEstimatedAt,
  }: ReadyForJuryEstimatedAtSchemaFormData) => {
    try {
      await setReadyForJuryEstimatedAt.mutateAsync({
        readyForJuryEstimatedAt,
      });
      successToast("modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };
  const handleDossierDeValidationFormSubmit = async (
    data: DossierDeValidationFormData,
  ) => {
    try {
      await sendDossierDeValidation(data);
      successToast("Modifications enregistrées");
      router.push(`/candidacies/${candidacyId}/summary`);
    } catch (e) {
      errorToast((e as Error).message);
    }
  };

  // When the candidacy has a failed jury result,
  // the user can submit another dossier de validation
  const failedJuryResults = [
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
    "FAILURE",
    "CANDIDATE_EXCUSED",
    "CANDIDATE_ABSENT",
  ];

  const hasFailedJuryResult =
    candidacy?.jury?.result &&
    failedJuryResults.includes(candidacy.jury.result);

  const dossierDeValidationActiveAndNotIncomplete =
    dossierDeValidation?.decision !== "INCOMPLETE";

  if (getCandidacyStatus === "pending") {
    return <Skeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1 className="mb-0">Dossier de validation</h1>

      {getCandidacyStatus === "success" &&
      !hasFailedJuryResult &&
      dossierDeValidation &&
      dossierDeValidationActiveAndNotIncomplete ? (
        <ReadOnlyDossierDeValidationView
          dossierDeValidation={{
            id: dossierDeValidation.id,
            sentAt: dossierDeValidation.dossierDeValidationSentAt,
            file: dossierDeValidation.dossierDeValidationFile,
            otherFiles: dossierDeValidation.dossierDeValidationOtherFiles,
            decision: dossierDeValidation.decision,
            decisionSentAt: dossierDeValidation.decisionSentAt,
            decisionComment: dossierDeValidation.decisionComment,
          }}
          historyDossierDeValidation={historyDossierDeValidation.map(
            (dossierDeValidation) => ({
              id: dossierDeValidation.id,
              sentAt: dossierDeValidation.dossierDeValidationSentAt,
              file: dossierDeValidation.dossierDeValidationFile,
              otherFiles: dossierDeValidation.dossierDeValidationOtherFiles,
              decision: dossierDeValidation.decision,
              decisionSentAt: dossierDeValidation.decisionSentAt,
              decisionComment: dossierDeValidation.decisionComment,
            }),
          )}
        />
      ) : (
        <Tabs
          tabs={[
            {
              label: "Date prévisionnelle",
              isDefault: !candidacy?.readyForJuryEstimatedAt,
              content: (
                <ReadyForJuryEstimatedDateTab
                  readyForJuryEstimatedAt={
                    candidacy?.readyForJuryEstimatedAt || undefined
                  }
                  onFormSubmit={handleReadyForJuryEstimatedAtFormSubmit}
                />
              ),
            },
            {
              label: "Dossier",
              isDefault: !!candidacy?.readyForJuryEstimatedAt,
              content: (
                <DossierDeValidationTab
                  dossierDeValidation={
                    dossierDeValidation
                      ? {
                          id: dossierDeValidation.id,
                          sentAt: dossierDeValidation.dossierDeValidationSentAt,
                          file: dossierDeValidation.dossierDeValidationFile,
                          otherFiles:
                            dossierDeValidation.dossierDeValidationOtherFiles,
                          decision: dossierDeValidation.decision,
                          decisionSentAt: dossierDeValidation.decisionSentAt,
                          decisionComment: dossierDeValidation.decisionComment,
                        }
                      : undefined
                  }
                  historyDossierDeValidation={historyDossierDeValidation.map(
                    (dossierDeValidation) => ({
                      id: dossierDeValidation.id,
                      sentAt: dossierDeValidation.dossierDeValidationSentAt,
                      file: dossierDeValidation.dossierDeValidationFile,
                      otherFiles:
                        dossierDeValidation.dossierDeValidationOtherFiles,
                      decision: dossierDeValidation.decision,
                      decisionSentAt: dossierDeValidation.decisionSentAt,
                      decisionComment: dossierDeValidation.decisionComment,
                    }),
                  )}
                  onFormSubmit={handleDossierDeValidationFormSubmit}
                />
              ),
            },
          ]}
        />
      )}
    </div>
  );
};

export default AapDossierDeValidationPage;
