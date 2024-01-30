"use client";
import { useDossierDeValidationPageLogic } from "@/app/feasibilities/dossier-de-validation/[dossierDeValidationId]/dossierDeValidationPageLogic";
import { AuthenticatedLink } from "@/components/authenticated-link/AuthenticatedLink";
import { format } from "date-fns";
import Link from "next/link";

const DossierDeValidationPage = () => {
  const { dossierDeValidation } = useDossierDeValidationPageLogic();

  return (
    <div className="flex flex-col flex-1 mb-2">
      <Link
        href="/feasibilities"
        className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
      >
        Tous les dossiers
      </Link>
      {dossierDeValidation && (
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mt-8 mb-4">
            Dossier de validation
          </h1>
          <p className="text-gray-600 mb-12">
            Vous avez reçu l'ensemble des documents liés au dossier de
            validation du candidat. Vous pouvez les consulter et les télécharger
            ci-dessous.
          </p>
          <p className="text-xs mb-7">
            <span className="uppercase text-xs font-bold">
              dossier déposé le :{" "}
            </span>
            {format(
              dossierDeValidation.dossierDeValidationSentAt,
              "dd/MM/yyyy",
            )}
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
    className="fr-link fr-icon-download-line fr-link--icon-right text-blue-900 text-lg ml-auto"
  />
);
