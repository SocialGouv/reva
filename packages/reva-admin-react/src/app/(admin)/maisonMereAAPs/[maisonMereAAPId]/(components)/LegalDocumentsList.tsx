import { AuthenticatedLink } from "@/components/authenticated-link/AuthenticatedLink";

type File = {
  name: string;
  url: string;
  mimeType: string;
};

const DownloadTile = ({
  name,
  url,
  mimeType,
}: {
  name: string;
  url: string;
  mimeType: string;
}) => {
  return (
    <div className="fr-tile fr-tile--download fr-enlarge-link">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <a href={url} target="blank" download>
              {name}
            </a>
          </h3>
          <p className="fr-tile__detail">
            {mimeType.split("/").pop()?.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
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
      <div className="grid grid-cols-2 gap-8">
        {attestationURSSAFFile && (
          <DownloadTile
            name="Attestation URSSAF"
            url={attestationURSSAFFile.url}
            mimeType={attestationURSSAFFile.mimeType}
          />
        )}
        {justificatifIdentiteDirigeantFile && (
          <DownloadTile
            name="Justificatif d'identité du dirigeant"
            url={justificatifIdentiteDirigeantFile.url}
            mimeType={justificatifIdentiteDirigeantFile.mimeType}
          />
        )}
        {lettreDeDelegationFile && (
          <DownloadTile
            name="Lettre de delegation"
            url={lettreDeDelegationFile.url}
            mimeType={lettreDeDelegationFile.mimeType}
          />
        )}
        {justificatifIdentiteDelegataireFile && (
          <DownloadTile
            name="Justificatif d'identité du delegataire"
            url={justificatifIdentiteDelegataireFile.url}
            mimeType={justificatifIdentiteDelegataireFile.mimeType}
          />
        )}
      </div>
    </div>
  );
}
