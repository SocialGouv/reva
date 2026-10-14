"use client";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { useRouter } from "next/navigation";

import { Panel } from "@/components/layout/Panel";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { JuryResult } from "@/graphql/generated/graphql";

import {
  DepotDvForm,
  DossierDeValidationFormData,
} from "./_components/DepotDvForm";
import { useDepotDossierDeValidationPage } from "./depotDossierDeValidation.hook";

const failedJuryResults: JuryResult[] = [
  "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
  "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
  "FAILURE",
  "CANDIDATE_EXCUSED",
  "CANDIDATE_ABSENT",
];

export default function DepotDvPage() {
  const router = useRouter();
  const {
    certification,
    dossierDeValidation,
    dossierDeValidationProblems,
    sendDossierDeValidation,
    queryStatus,
    jury,
  } = useDepotDossierDeValidationPage();

  if (queryStatus === "pending") {
    return <div>Chargement...</div>;
  }

  const hasFailedJuryResult =
    jury?.result && failedJuryResults.includes(jury.result);

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
      router.push("../");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <Panel>
      <div className="flex flex-col">
        <Breadcrumb
          currentPageLabel="Dépôt du dossier de validation"
          className="mb-4"
          segments={[
            {
              label: "Ma candidature",
              linkProps: {
                href: "../../",
              },
            },
            {
              label: "Dossier de validation",
              linkProps: {
                href: "../",
              },
            },
          ]}
        />
        <h1>Dépôt du dossier de validation</h1>
        <p className="text-lg mb-12">
          Une fois le dossier complété, déposez-le ici. Vous pourrez également
          joindre les pièces supplémentaires requises et, si nécessaire,
          demander un aménagement spécifique pour le passage devant le jury.
        </p>
        <DepotDvForm
          dossierDeValidation={dossierDeValidation}
          dossierDeValidationProblems={dossierDeValidationProblems}
          jury={jury}
          hasFailedJuryResult={!!hasFailedJuryResult}
          onSubmit={handleDossierDeValidationFormSubmit}
          certification={certification}
        />
      </div>
    </Panel>
  );
}
