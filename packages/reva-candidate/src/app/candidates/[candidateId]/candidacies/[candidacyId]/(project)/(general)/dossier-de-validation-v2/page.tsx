"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { format, toDate } from "date-fns";

import { Panel } from "@/components/layout/Panel";

import { JuryResult } from "@/graphql/generated/graphql";

import { DateAndSubmissionTiles } from "./_components/DateAndSubmissionTiles";
import { ResourcesSection } from "./_components/ResourcesSection";
import { ReadOnlyDossierDeValidationTab } from "./_components/tabs/read-only-dossier-de-validation-tab/ReadOnlyDossierDeValidationTab";
import { ReadOnlyReadyForJuryEstimatedDateTab } from "./_components/tabs/read-only-ready-for-jury-estimated-date-tab/ReadOnlyReadyForJuryEstimatedDateTab";
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
    queryStatus,
    jury,
  } = useDossierDeValidationPage();

  const hasFailedJuryResult =
    jury?.result && failedJuryResults.includes(jury.result);

  const readOnlyView =
    dossierDeValidation &&
    dossierDeValidation.decision !== "INCOMPLETE" &&
    !hasFailedJuryResult;

  return (
    <Panel>
      <div className="flex flex-col">
        <Breadcrumb
          currentPageLabel="Dossier de validation"
          className="mb-0"
          segments={[
            {
              label: "Ma candidature",
              linkProps: {
                href: "../",
              },
            },
          ]}
        />
        <h1 className="mt-6 mb-4">Dossier de validation</h1>
        <p className="text-lg">
          Une fois le dossier déposé, le certificateur pourra procéder à
          l’organisation du passage devant le jury.
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
              <div className="flex flex-row gap-4">
                <div className="lg:basis-9/12">
                  <DateAndSubmissionTiles
                    readyForJuryEstimatedAt={
                      readyForJuryEstimatedAt
                        ? format(readyForJuryEstimatedAt, "dd/MM/yyyy")
                        : undefined
                    }
                  />
                </div>
                <div className="lg:basis-3/12">
                  <ResourcesSection certification={certification} />
                </div>
              </div>
            )}
          </>
        )}
        <Button
          priority="secondary"
          linkProps={{ href: "../" }}
          className="mt-12"
        >
          Retour
        </Button>
      </div>
    </Panel>
  );
}
