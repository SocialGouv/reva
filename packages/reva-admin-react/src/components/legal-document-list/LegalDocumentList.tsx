export const LegalDocumentList = ({
  attestationURSSAFFileUrl,
  justificatifIdentiteDirigeantFileUrl,
  lettreDeDelegationFileUrl,
  justificatifIdentiteDelegataireFileUrl,
}: {
  attestationURSSAFFileUrl?: string | null;
  justificatifIdentiteDirigeantFileUrl?: string | null;
  lettreDeDelegationFileUrl?: string | null;
  justificatifIdentiteDelegataireFileUrl?: string | null;
}) => {
  return (
    <div className="mb-8">
      <h3>Pièces jointes à vérifier</h3>
      <p className="mb-4 text-dsfr-blue-france-sun-113">
        <a
          href="https://www.urssaf.fr/accueil/outils-documentation/outils/verification-attestation.html"
          target="_blank"
        >
          Lien vers la vérification URSSAF
        </a>
      </p>
      <div className="grid grid-cols-1 gap-8">
        {attestationURSSAFFileUrl && (
          <iframe
            className="w-full h-[500px]"
            title="Attestation URSSAF"
            name="Attestation URSSAF"
            src={attestationURSSAFFileUrl}
          ></iframe>
        )}
        {justificatifIdentiteDirigeantFileUrl && (
          <iframe
            className="w-full h-[500px]"
            title="Justificatif d'identité du dirigeant"
            name="Justificatif d'identité du dirigeant"
            src={justificatifIdentiteDirigeantFileUrl}
          ></iframe>
        )}
        {lettreDeDelegationFileUrl && (
          <iframe
            className="w-full h-[500px]"
            title="Lettre de delegation"
            name="Lettre de delegation"
            src={lettreDeDelegationFileUrl}
          ></iframe>
        )}
        {justificatifIdentiteDelegataireFileUrl && (
          <iframe
            className="w-full h-[500px]"
            title="Justificatif d'identité du delegataire"
            name="Justificatif d'identité du delegataire"
            src={justificatifIdentiteDelegataireFileUrl}
          ></iframe>
        )}
      </div>
    </div>
  );
};
