"use client";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { ReadyForJuryEstimatedDateTab } from "./_components/tabs/ready-for-jury-estimated-date-tab/ReadyForJuryEstimatedAtTab";
import { useDossierDeValidationAutonomePage } from "./dossierDeValidationAutonome.hook";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { GraphQLError } from "graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import {
  DossierDeValidationFormData,
  DossierDeValidationTab,
} from "./_components/tabs/dossier-de-validation-tab/DossierDeValidationTab";
import { ReadOnlyReadyForJuryEstimatedDateTab } from "./_components/tabs/read-only-ready-for-jury-estimated-date-tab/ReadOnlyReadyForJuryEstimatedDateTab";

export default function DossierDeValidationAutonomePag() {
  const {
    readyForJuryEstimatedAt,
    certificationAuthority,
    dossierDeValidation,
    updateReadyForJuryEstimatedAt,
    sendDossierDeValidation,
    queryStatus,
  } = useDossierDeValidationAutonomePage();

  const handleReadyForJuryEstimatedDateFormSubmit = async ({
    readyForJuryEstimatedAt,
  }: {
    readyForJuryEstimatedAt: Date;
  }) => {
    try {
      await updateReadyForJuryEstimatedAt.mutateAsync({
        readyForJuryEstimatedAt,
      });
      successToast("Modifications enregistrées");
    } catch (error) {
      graphqlErrorToast(error as GraphQLError);
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
      successToast("Modifications enregistrées");
    } catch (error) {
      graphqlErrorToast(error as GraphQLError);
    }
  };

  const readOnlyView =
    dossierDeValidation && dossierDeValidation.decision !== "INCOMPLETE";

  return (
    <div className="flex flex-col">
      <h1>Dossier de validation</h1>
      <p>
        Renseignez les informations liées à votre dossier de validation puis
        déposez-le afin de la transmettre au certificateur.
      </p>
      {queryStatus === "success" && (
        <>
          {readOnlyView ? (
            <Tabs
              tabs={[
                {
                  label: "Date prévisionnelle",
                  isDefault: true,
                  content: (
                    <ReadOnlyReadyForJuryEstimatedDateTab
                      readyForJuryEstimatedAt={
                        readyForJuryEstimatedAt
                          ? new Date(readyForJuryEstimatedAt)
                          : undefined
                      }
                      certificationAuthorityInfo={{
                        email: certificationAuthority?.contactEmail || "",
                        name: certificationAuthority?.contactFullName || "",
                      }}
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
                  isDefault: true,
                  content: (
                    <ReadyForJuryEstimatedDateTab
                      defaultValues={{
                        readyForJuryEstimatedAt: readyForJuryEstimatedAt
                          ? new Date(readyForJuryEstimatedAt)
                          : undefined,
                      }}
                      certificationAuthorityInfo={{
                        email: certificationAuthority?.contactEmail || "",
                        name: certificationAuthority?.contactFullName || "",
                      }}
                      onSubmit={handleReadyForJuryEstimatedDateFormSubmit}
                    />
                  ),
                },
                {
                  label: "Dêpot du dossier",
                  isDefault: false,
                  content: (
                    <DossierDeValidationTab
                      certificationAuthorityInfo={{
                        email: certificationAuthority?.contactEmail || "",
                        name: certificationAuthority?.contactFullName || "",
                      }}
                      onSubmit={handleDossierDeValidationFormSubmit}
                    />
                  ),
                },
              ]}
            />
          )}
        </>
      )}
      <Button priority="tertiary" linkProps={{ href: "/" }} className="mt-12">
        Retour
      </Button>
    </div>
  );
}
