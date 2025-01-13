"use client";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { format } from "date-fns";
import { useDossierDeValidationPageLogic } from "./dossierDeValidationPageLogic";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { BackButton } from "@/components/back-button/BackButton";
import { HistoryDossierDeValidationView } from "./_components/HistoryDossierDeValidationView";
import { DossierDeValidationCard } from "./_components/DossierDeValidationCard";

const DossierDeValidationPage = () => {
  return (
    <div className="flex flex-col w-full">
      <BackButton href="/candidacies/dossiers-de-validation">
        Tous les dossiers
      </BackButton>
      <h1>Dossier de validation</h1>
      <Tabs
        tabs={[
          {
            label: "Date prévisionnelle",
            content: <ReadyForJuryEstimatedDateTab />,
          },
          {
            label: "Dossier",
            isDefault: true,
            content: <DossierDeValidationTab />,
          },
        ]}
      />
    </div>
  );
};

const ReadyForJuryEstimatedDateTab = () => {
  const { readyForJuryEstimatedAt, getDossierDeValidationStatus } =
    useDossierDeValidationPageLogic();

  const showContent = getDossierDeValidationStatus === "success";

  return (
    showContent && (
      <div className="flex flex-col overflow-auto">
        {readyForJuryEstimatedAt ? (
          <>
            <p className="text-gray-600 mb-12">
              Afin de faciliter la tenue du jury pour le candidat, l’AAP a
              renseigné la date prévisionnelle à laquelle son candidat sera
              potentiellement prêt pour son passage devant le jury.
            </p>
            <span className="uppercase font-bold text-sm">
              date prévisionnelle
            </span>
            <span className="text-base">
              {format(readyForJuryEstimatedAt, "dd/MM/yyyy")}
            </span>
          </>
        ) : (
          <Alert
            severity="info"
            title="Attente de la date prévisionnelle"
            description={
              <>
                <p className="mt-4">
                  Afin de faciliter la tenue du jury, l’AAP renseignera la date
                  prévisionnelle qui correspond :
                </p>
                <br />
                <ul className="list-disc list-inside">
                  <li>
                    à la date à laquelle le candidat aura finalisé son dossier
                    de validation pour les certifications du Ministère du
                    Travail et des Branches Professionnelles
                  </li>
                  <li>
                    à la date de dépôt du dossier de validation pour les autres
                    certifications
                  </li>
                </ul>
              </>
            }
          />
        )}
      </div>
    )
  );
};

const DossierDeValidationTab = () => {
  const {
    dossierDeValidation,
    historyDossierDeValidation,
    candidacy,
    getDossierDeValidationStatus,
    canSignalProblem,
  } = useDossierDeValidationPageLogic();

  const showContent = getDossierDeValidationStatus === "success";

  return (
    showContent && (
      <div className="flex flex-col gap-10 flex-1 mb-2 overflow-auto">
        {dossierDeValidation && (
          <h6 className="font-normal m-0">
            Voici les documents du dossier de validation du candidat.
          </h6>
        )}

        <HistoryDossierDeValidationView
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

        {dossierDeValidation ? (
          <>
            <DossierDeValidationCard
              dossierDeValidation={{
                id: dossierDeValidation.id,
                sentAt: dossierDeValidation.dossierDeValidationSentAt,
                file: dossierDeValidation.dossierDeValidationFile,
                otherFiles: dossierDeValidation.dossierDeValidationOtherFiles,
                decision: dossierDeValidation.decision,
                decisionSentAt: dossierDeValidation.decisionSentAt,
                decisionComment: dossierDeValidation.decisionComment,
              }}
            />

            {canSignalProblem && (
              <Button
                priority="secondary"
                className="mt-10 ml-auto"
                linkProps={{
                  href: `/candidacies/${candidacy?.id}/dossier-de-validation/problem`,
                }}
              >
                Signaler un problème
              </Button>
            )}
          </>
        ) : (
          <Alert
            severity="info"
            title="Attente du dossier de validation"
            description={
              <>
                <p>
                  Le candidat (ou son AAP) doit vous transmettre son dossier de
                  validation une fois qu’il est finalisé.
                </p>
                <p className="mt-4">
                  Le passage devant le jury devra alors avoir lieu dans un délai
                  maximum de 3 mois à compter de la réception du dossier.
                </p>
                <p className="mt-4">
                  Si vous ne demandez pas la transmission du dossier de
                  validation avant le passage en jury du candidat, un courrier
                  vous informant que le candidat sera prêt à se présenter devant
                  le jury dans un délai de 3 mois vous sera transmis à la place.
                </p>
              </>
            }
          />
        )}
      </div>
    )
  );
};

export default DossierDeValidationPage;
