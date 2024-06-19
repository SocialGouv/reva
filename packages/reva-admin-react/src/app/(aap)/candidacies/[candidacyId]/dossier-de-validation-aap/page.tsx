"use client";

import { useParams, useRouter } from "next/navigation";

import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { useAapDossierDeValidationPage } from "./aapDossierDeValidation.hooks";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { parse } from "date-fns";
import {
  successToast,
  graphqlErrorToast,
  errorToast,
} from "@/components/toast/toast";
import {
  ReadyForJuryEstimatedAtSchemaFormData,
  ReadyForJuryEstimatedDateTab,
} from "./_components/ReadyForJuryEstimatedDateTab";
import { ReadOnlyDossierDeValidationView } from "./_components/ReadOnlyDossierDeValidationView";
import {
  DossierDeValidationFormData,
  DossierDeValidationTab,
} from "./_components/DossierDeValidationTab";

const AapDossierDeValidationPage = () => {
  const router = useRouter();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const {
    candidacy,
    dossierDeValidation,
    dossierDeValidationProblems,
    getCandidacyStatus,
    setReadyForJuryEstimatedAt,
    sendDossierDeValidation,
  } = useAapDossierDeValidationPage();

  const handleReadyForJuryEstimatedAtFormSubmit = async ({
    readyForJuryEstimatedAt,
  }: ReadyForJuryEstimatedAtSchemaFormData) => {
    try {
      await setReadyForJuryEstimatedAt.mutateAsync({
        readyForJuryEstimatedAt: parse(
          readyForJuryEstimatedAt,
          "yyyy-MM-dd",
          new Date(),
        ).getTime(),
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

  const dossierDeValidationActiveAndNotIncomplete =
    dossierDeValidation?.decision !== "INCOMPLETE";
  return (
    <div className="flex flex-col gap-6">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1 className="mb-0">Dossier de validation</h1>

      {getCandidacyStatus === "success" &&
      dossierDeValidation &&
      dossierDeValidationActiveAndNotIncomplete ? (
        <ReadOnlyDossierDeValidationView
          dossierDeValidationSentAt={
            new Date(dossierDeValidation.dossierDeValidationSentAt)
          }
          dossierDeValidationFile={dossierDeValidation.dossierDeValidationFile}
          dossierDeValidationOtherFiles={
            dossierDeValidation.dossierDeValidationOtherFiles
          }
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
                  dossierDeValidationIncomplete={
                    dossierDeValidation?.decision === "INCOMPLETE"
                  }
                  dossierDeValidationSentAt={
                    dossierDeValidation?.dossierDeValidationSentAt
                      ? new Date(dossierDeValidation?.dossierDeValidationSentAt)
                      : undefined
                  }
                  dossierDeValidationProblems={dossierDeValidationProblems}
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
