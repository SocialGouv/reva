"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { toDate } from "date-fns";
import { useRouter } from "next/navigation";

import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { JuryResult } from "@/graphql/generated/graphql";

import {
  DossierDeValidationFormData,
  DossierDeValidationTab,
} from "./_components/tabs/dossier-de-validation-tab/DossierDeValidationTab";
import { ReadOnlyDossierDeValidationTab } from "./_components/tabs/read-only-dossier-de-validation-tab/ReadOnlyDossierDeValidationTab";
import { ReadOnlyReadyForJuryEstimatedDateTab } from "./_components/tabs/read-only-ready-for-jury-estimated-date-tab/ReadOnlyReadyForJuryEstimatedDateTab";
import { ReadyForJuryEstimatedDateTab } from "./_components/tabs/ready-for-jury-estimated-date-tab/ReadyForJuryEstimatedAtTab";
import { useDossierDeValidationPage } from "./dossierDeValidation.hook";

const failedJuryResults: JuryResult[] = [
  "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
  "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
  "FAILURE",
  "CANDIDATE_EXCUSED",
  "CANDIDATE_ABSENT",
];

export default function DossierDeValidationPag() {
  const {
    readyForJuryEstimatedAt,
    certification,
    dossierDeValidation,
    dossierDeValidationProblems,
    updateReadyForJuryEstimatedAt,
    sendDossierDeValidation,
    queryStatus,
    jury,
  } = useDossierDeValidationPage();

  const router = useRouter();

  const handleReadyForJuryEstimatedDateFormSubmit = async ({
    readyForJuryEstimatedAt,
  }: {
    readyForJuryEstimatedAt: Date;
  }) => {
    try {
      await updateReadyForJuryEstimatedAt.mutateAsync({
        readyForJuryEstimatedAt,
      });
      successToast("La date prévisionnelle a été enregistrée");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const handleDossierDeValidationFormSubmit = async ({
    dossierDeValidationFile,
    dossierDeValidationOtherFiles,
  }: DossierDeValidationFormData) => {
    try {
      await sendDossierDeValidation({
        dossierDeValidationFile,
        dossierDeValidationOtherFiles,
      });
      successToast("Votre dossier de validation a été envoyé");
      router.push("/");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const hasFailedJuryResult =
    jury?.result && failedJuryResults.includes(jury.result);

  const readOnlyView =
    dossierDeValidation &&
    dossierDeValidation.decision !== "INCOMPLETE" &&
    !hasFailedJuryResult;

  return (
    <div className="flex flex-col">
      <h1>Dossier de validation</h1>
      <p>
        Renseignez les informations liées à votre dossier de validation puis
        déposez-le afin de le transmettre au certificateur. Si votre
        certification n'est pas totalement validée, vous pourrez déposer un
        second dossier une fois votre résultat communiqué.
      </p>
      {queryStatus === "success" && (
        <>
          {readOnlyView ? (
            <Tabs
              tabs={[
                {
                  label: "Date prévisionnelle",
                  isDefault: false,
                  content: (
                    <ReadOnlyReadyForJuryEstimatedDateTab
                      readyForJuryEstimatedAt={
                        readyForJuryEstimatedAt
                          ? toDate(readyForJuryEstimatedAt)
                          : undefined
                      }
                    />
                  ),
                },
                {
                  label: "Dépôt du dossier",
                  isDefault: true,
                  content: (
                    <ReadOnlyDossierDeValidationTab
                      dossierDeValidationSentAt={
                        dossierDeValidation.dossierDeValidationSentAt
                          ? toDate(
                              dossierDeValidation.dossierDeValidationSentAt,
                            )
                          : undefined
                      }
                      dossierDeValidationFile={
                        dossierDeValidation.dossierDeValidationFile
                      }
                      dossierDeValidationOtherFiles={
                        dossierDeValidation.dossierDeValidationOtherFiles
                      }
                      certification={certification}
                    />
                  ),
                },
              ]}
            />
          ) : (
            <Tabs
              tabs={[
                {
                  label: "Date prévisionnelle",
                  isDefault: !readyForJuryEstimatedAt,
                  content: (
                    <ReadyForJuryEstimatedDateTab
                      defaultValues={{
                        readyForJuryEstimatedAt: readyForJuryEstimatedAt
                          ? toDate(readyForJuryEstimatedAt)
                          : undefined,
                      }}
                      onSubmit={handleReadyForJuryEstimatedDateFormSubmit}
                    />
                  ),
                },
                {
                  label: "Dépôt du dossier",
                  isDefault: !!readyForJuryEstimatedAt,
                  content: (
                    <DossierDeValidationTab
                      dossierDeValidationIncomplete={
                        dossierDeValidation?.decision === "INCOMPLETE"
                      }
                      dossierDeValidationProblems={dossierDeValidationProblems}
                      certification={certification}
                      onSubmit={handleDossierDeValidationFormSubmit}
                    />
                  ),
                },
              ]}
            />
          )}
        </>
      )}
      <Button priority="secondary" linkProps={{ href: "/" }} className="mt-12">
        Retour
      </Button>
    </div>
  );
}
