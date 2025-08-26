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

      <div className="flex flex-col space-y-6">
        {infoTemplate?.previewUrl && (
          <div>
            <Link
              href={infoTemplate.previewUrl}
              className="fr-link fr-link--sm"
              target="_blank"
            >
              Trame du dossier de validation
            </Link>
          </div>
        )}
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
            href={`/candidat/certification/${certification.id}/`}
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
