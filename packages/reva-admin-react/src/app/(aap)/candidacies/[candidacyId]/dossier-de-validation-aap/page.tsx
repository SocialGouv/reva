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
import {
  DossierDeValidationFormData,
  DossierDeValidationTab,
} from "./_components/DossierDeValidationTab";
import { REST_API_URL } from "@/config/config";
import { useKeycloakContext } from "@/components/auth/keycloakContext";

const AapDossierDeValidationPage = () => {
  const router = useRouter();
  const { accessToken } = useKeycloakContext();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { candidacy, getCandidacyStatus, setReadyForJuryEstimatedAt } =
    useAapDossierDeValidationPage();

  const updateReadyForJuryEstimatedAt = async ({
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

  const sendDossierDeValidation = async (data: DossierDeValidationFormData) => {
    const formData = new FormData();

    formData.append("candidacyId", candidacyId);

    if (data.dossierDeValidationFile?.[0]) {
      formData.append(
        "dossierDeValidationFile",
        data.dossierDeValidationFile?.[0],
      );
    }

    data.dossierDeValidationOtherFiles.forEach(
      (f) => f?.[0] && formData.append("dossierDeValidationOtherFiles", f?.[0]),
    );

    const result = await fetch(
      `${REST_API_URL}/dossier-de-validation/upload-dossier-de-validation`,
      {
        method: "post",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );
    if (result.ok) {
      successToast("Modifications enregistrées");
      router.push(`/candidacies/${candidacyId}/summary`);
    } else {
      errorToast(await result.text());
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1 className="mb-0">Dossier de validation</h1>

      {getCandidacyStatus === "success" && (
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
                  onFormSubmit={updateReadyForJuryEstimatedAt}
                />
              ),
            },
            {
              label: "Dossier",
              isDefault: !!candidacy?.readyForJuryEstimatedAt,
              content: (
                <DossierDeValidationTab
                  onFormSubmit={sendDossierDeValidation}
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
