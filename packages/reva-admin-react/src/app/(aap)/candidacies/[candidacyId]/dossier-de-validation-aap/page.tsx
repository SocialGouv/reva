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
import { ReadyForJuryEstimatedAtSchemaFormData } from "./_components/ReadyForJuryEstimatedDateTab";
import { ReadyForJuryEstimatedAtAndDossierDeValidationTabs } from "./_components/ReadyForJuryEstimatedAtAndDossierDeValidationTabs";
import { ReadOnlyDossierDeValidationView } from "./_components/ReadOnlyDossierDeValidationView";
import { DossierDeValidationFormData } from "./_components/DossierDeValidationTab";

const AapDossierDeValidationPage = () => {
  const router = useRouter();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const {
    candidacy,
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

  const dossierDeValidation = candidacy?.activeDossierDeValidation;
  return (
    <div className="flex flex-col gap-6">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1 className="mb-0">Dossier de validation</h1>

      {getCandidacyStatus === "success" && dossierDeValidation ? (
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
        <ReadyForJuryEstimatedAtAndDossierDeValidationTabs
          readyForJuryEstimatedAt={candidacy?.readyForJuryEstimatedAt}
          onReadyForJuryEstimatedAtFormSubmit={
            handleReadyForJuryEstimatedAtFormSubmit
          }
          onDossierDeValidationFormSubmit={handleDossierDeValidationFormSubmit}
        />
      )}
    </div>
  );
};
export default AapDossierDeValidationPage;
