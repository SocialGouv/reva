import Link from "next/link";

interface ResourcesSectionProps {
  certification: {
    id: string;
    label: string;
    additionalInfo?: {
      dossierDeValidationTemplate?: {
        previewUrl?: string | null;
      } | null;
      dossierDeValidationLink?: string | null;
    } | null;
  } | null;
}

export const ResourcesSection = ({ certification }: ResourcesSectionProps) => {
  if (!certification) {
    return null;
  }

  const { additionalInfo } = certification;
  const infoTemplate = additionalInfo?.dossierDeValidationTemplate;
  const infoLink = additionalInfo?.dossierDeValidationLink;

  return (
    <aside className="w-[352px] bg-dsfrBlue-200 pl-4 pt-4 pb-8 pr-2 self-start">
      <div className="fr-text--lead font-bold">Ressources :</div>

      <p>
        Téléchargez votre trame du dossier de validation qui correspond au
        diplôme de votre parcours de VAE. Cette trame offre un cadre qui permet
        de suivre les attendus du certificateur.
      </p>

      {infoTemplate?.previewUrl && (
        <a
          target="_blank"
          href={infoTemplate.previewUrl}
          className="block bg-white border border-gray-300 hover:bg-gray-100 p-6 pb-5 mb-6 [&::after]:content-none bg-none"
        >
          <h6 className="text-dsfrBlue-500 mb-4">
            Trame du dossier de validation
          </h6>
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">PDF</div>
            <i
              className="fr-icon-download-line fr-icon--sm text-dsfrBlue-500"
              aria-hidden="true"
            ></i>
          </div>
        </a>
      )}

      <div className="flex flex-col space-y-6">
        {infoLink && (
          <div>
            <Link
              href={infoLink}
              className="fr-link fr-link--sm"
              target="_blank"
            >
              Trame du dossier de validation
            </Link>
          </div>
        )}
        <div>
          <Link
            href="https://vae.gouv.fr/savoir-plus/articles/rediger-dossier-validation/"
            className="fr-link fr-link--sm"
            target="_blank"
          >
            Comment rédiger son dossier de validation ?
          </Link>
        </div>
        <div>
          <Link
            href={`/certification/${certification.id}/`}
            className="fr-link fr-link--sm"
            target="_blank"
          >
            Consultez la fiche de la certification
          </Link>
        </div>
      </div>
    </aside>
  );
};
