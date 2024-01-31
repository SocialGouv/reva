"use client";
import { AuthenticatedLink } from "@/components/authenticated-link/AuthenticatedLink";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { format } from "date-fns";
import Link from "next/link";
import { useDossierDeValidationPageLogic } from "./dossierDeValidationPageLogic";

const DossierDeValidationPage = () => {
  return (
    <div className="flex flex-col w-full">
      <Link
        href="/candidacies/dossiers-de-validation"
        className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
      >
        Tous les dossiers
      </Link>
      <h1 className="text-3xl font-bold my-8">Dossier de validation</h1>
      <Tabs
        tabs={[
          {
            label: "Date prévisionnelle",
            content: <EstimatedExamDateTab />,
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

const EstimatedExamDateTab = () => {
  const { estimatedExamDate } = useDossierDeValidationPageLogic();

  return (
    <div className="flex flex-col overflow-auto">
      {estimatedExamDate ? (
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
            {format(estimatedExamDate, "dd/MM/yyyy")}
          </span>
        </>
      ) : (
        <Alert
          severity="info"
          title="Attente de la date prévisionnelle"
          description="Afin de faciliter la tenue du jury pour le candidat, l’AAP renseignera la date prévisionnelle à laquelle son candidat sera potentiellement prêt pour son passage devant le jury."
        />
      )}
    </div>
  );
};

const DossierDeValidationTab = () => {
  const { dossierDeValidation } = useDossierDeValidationPageLogic();

  return (
    <div className="flex flex-col flex-1 mb-2 overflow-auto">
      {dossierDeValidation ? (
        <div className="flex flex-col">
          <p className="text-gray-600 mb-12">
            Voici les documents du dossier de validation du candidat.
          </p>
          <p className="text-xs mb-7">
            <span className="uppercase text-xs font-bold align-text-top">
              dossier déposé le :{" "}
            </span>
            <span className="text-base">
              {format(
                dossierDeValidation.dossierDeValidationSentAt,
                "dd/MM/yyyy",
              )}
            </span>
          </p>
          <p>
            <span className="uppercase text-xs font-bold">
              contenu du dossier :
            </span>
          </p>
          <ul>
            <li className="mt-4">
              <FileLink
                text={dossierDeValidation.dossierDeValidationFile.name}
                url={dossierDeValidation.dossierDeValidationFile.url}
              />
            </li>
            {dossierDeValidation.dossierDeValidationOtherFiles.map((f) => (
              <li key={f.url} className="mt-2">
                <FileLink text={f.name} url={f.url} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Alert
          severity="info"
          title="Attente du dossier de validation"
          description={
            <>
              <p>
                Le candidat (ou son AAP) vous transmettra son dossier de
                validation dès qu'il sera finalisé.
              </p>
              <p className="mt-4">
                Une date de passage devant le jury devra alors lui être
                communiquée dans les 3 mois maximum suivant la réception du
                dossier.
              </p>
            </>
          }
        />
      )}
    </div>
  );
};

export default DossierDeValidationPage;

const FileLink = ({ url, text }: { url: string; text: string }) => (
  <AuthenticatedLink
    text={text}
    title={text}
    url={url}
    className="fr-link fr-icon-download-line fr-link--icon-right text-blue-900 text-lg ml-auto break-words"
  />
);
