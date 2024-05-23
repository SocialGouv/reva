type File = {
  name: string;
  url: string;
  mimeType: string;
  previewUrl?: string | null;
};

export default function LegalDocumentsList({
  attestationURSSAFFile,
  justificatifIdentiteDirigeantFile,
  lettreDeDelegationFile,
  justificatifIdentiteDelegataireFile,
}: {
  attestationURSSAFFile?: File | null;
  justificatifIdentiteDirigeantFile?: File | null;
  lettreDeDelegationFile?: File | null;
  justificatifIdentiteDelegataireFile?: File | null;
}) {
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
        {attestationURSSAFFile?.previewUrl && (
          <iframe
            className="w-full h-[500px]"
            title="Attestation URSSAF"
            name="Attestation URSSAF"
            src={attestationURSSAFFile.previewUrl}
            // type={attestationURSSAFFile.mimeType}
          ></iframe>
        )}
        {justificatifIdentiteDirigeantFile?.previewUrl && (
          <iframe
            className="w-full h-[500px]"
            title="Justificatif d'identité du dirigeant"
            name="Justificatif d'identité du dirigeant"
            src={justificatifIdentiteDirigeantFile.previewUrl}
            // type={justificatifIdentiteDirigeantFile.mimeType}
          ></iframe>
        )}
        {lettreDeDelegationFile?.previewUrl && (
          <iframe
            className="w-full h-[500px]"
            title="Lettre de delegation"
            name="Lettre de delegation"
            src={lettreDeDelegationFile.previewUrl}
            // type={lettreDeDelegationFile.mimeType}
          ></iframe>
        )}
        {justificatifIdentiteDelegataireFile?.previewUrl && (
          <iframe
            className="w-full h-[500px]"
            title="Justificatif d'identité du delegataire"
            name="Justificatif d'identité du delegataire"
            src={justificatifIdentiteDelegataireFile.previewUrl}
            // type={justificatifIdentiteDelegataireFile.mimeType}
          ></iframe>
        )}
      </div>
    </div>
  );
}
