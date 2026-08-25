export const LegalDocumentList = ({
  attestationURSSAFFileUrl,
  justificatifIdentiteDirigeantFileUrl,
  lettreDeDelegationFileUrl,
  justificatifIdentiteDelegataireFileUrl,
  collapsible,
}: {
  attestationURSSAFFileUrl?: string | null;
  justificatifIdentiteDirigeantFileUrl?: string | null;
  lettreDeDelegationFileUrl?: string | null;
  justificatifIdentiteDelegataireFileUrl?: string | null;
  collapsible?: boolean;
}) => {
  const documents = [
    {
      title: "Attestation URSSAF ou attestation MSA",
      url: attestationURSSAFFileUrl,
    },
    {
      title: "Copie du justificatif d'identité du dirigeant",
      url: justificatifIdentiteDirigeantFileUrl,
    },
    { title: "Lettre de délégation", url: lettreDeDelegationFileUrl },
    {
      title: "Copie du justificatif d'identité du délégataire",
      url: justificatifIdentiteDelegataireFileUrl,
    },
  ].filter(
    (document): document is { title: string; url: string } => !!document.url,
  );

  return (
    <div className="mb-8">
      <h3>
        {collapsible ? "Pièces justificatives" : "Pièces jointes à vérifier"}
      </h3>
      <p className="mb-4 text-dsfr-blue-france-sun-113">
        <a
          href="https://www.urssaf.fr/accueil/outils-documentation/outils/verification-attestation.html"
          target="_blank"
        >
          Lien vers la vérification URSSAF
        </a>
      </p>
      {/* Absence explicite: l'administrateur doit pouvoir distinguer une mise à jour
          sans pièce attendue d'une pièce manquante. */}
      {!documents.length && <p>Aucune pièce transmise pour cette demande.</p>}
      <div
        className={
          collapsible ? "border-t border-neutral-300" : "grid grid-cols-1 gap-8"
        }
      >
        {documents.map(({ title, url }) => {
          const preview = (
            <iframe
              key={title}
              className={
                collapsible ? "w-full h-[500px] mb-4" : "w-full h-[500px]"
              }
              title={title}
              name={title}
              src={url}
            ></iframe>
          );

          return collapsible ? (
            <details key={title} className="border-b border-neutral-300">
              <summary className="flex items-center justify-between gap-4 py-3 px-4 cursor-pointer list-none text-dsfr-blue-france-sun-113 [&::-webkit-details-marker]:hidden">
                <span>{title}</span>
                <span className="fr-icon-eye-line" aria-hidden="true" />
              </summary>
              {preview}
            </details>
          ) : (
            preview
          );
        })}
      </div>
    </div>
  );
};
