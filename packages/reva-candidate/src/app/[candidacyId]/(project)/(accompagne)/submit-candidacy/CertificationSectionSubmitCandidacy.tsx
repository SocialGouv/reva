import Tag from "@codegouvfr/react-dsfr/Tag";
import Image from "next/image";

export default function CertificationSectionSubmitCandidacy({
  isAapAvailable,
  codeRncp,
  label,
}: {
  isAapAvailable: boolean;
  codeRncp?: string;
  label?: string;
}) {
  if (!codeRncp || !label) return null;

  return (
    <div className="mt-10">
      <div className="flex">
        <span className="fr-icon-award-fill fr-icon--lg mr-2" />
        <h2>Certification visée</h2>
      </div>
      <div className="pl-10">
        <div className="p-6 border border-dsfr-light-text-mention-grey">
          {isAapAvailable ? (
            <Tag small className="mb-3">
              <span
                data-testid="tag-modalite-inconnue-accompagne-disponible"
                className="truncate"
              >
                VAE en autonomie ou accompagnée
              </span>
            </Tag>
          ) : (
            <Tag small className="mb-3">
              <span data-testid="tag-modalite-inconnue-accompagne-indisponible">
                VAE en autonomie
              </span>
            </Tag>
          )}

          <div className="flex items-center gap-2 mb-3">
            <Image
              src="/candidat/images/pictograms/verified-badge.svg"
              alt="Success pictogram"
              width={16}
              height={16}
            />
            <p className="text-sm text-dsfr-light-text-mention-grey mb-0">
              RNCP {codeRncp}
            </p>
          </div>
          <h4 className="mb-2">{label}</h4>
        </div>
      </div>
    </div>
  );
}
