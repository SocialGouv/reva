import { ConformiteNormeAccessibilite } from "@/graphql/generated/graphql";

export const OrganismCardInformationsCommerciales = ({
  organism: o,
}: {
  organism?: {
    adresseInformationsComplementaires?: string | null;
    adresseCodePostal?: string | null;
    adresseVille?: string | null;
    adresseNumeroEtNomDeRue?: string | null;
    conformeNormesAccessibilite?: ConformiteNormeAccessibilite | null;
  };
}) => {
  return (
    <div>
      <div className="flex gap-x-2">
        <span
          className="fr-icon-home-4-line fr-icon--sm"
          aria-hidden="true"
        ></span>
        {o &&
        (o.adresseNumeroEtNomDeRue ||
          o.adresseInformationsComplementaires ||
          o.adresseCodePostal ||
          o.adresseVille) ? (
          <address
            data-testid="project-organisms-organism-address"
            className="not-italic"
          >
            {o.adresseNumeroEtNomDeRue}
            {o.adresseNumeroEtNomDeRue && <br />}
            {o.adresseInformationsComplementaires}
            {o.adresseInformationsComplementaires && <br />}
            {o.adresseCodePostal} {o.adresseVille}
          </address>
        ) : (
          <address className="text-gray-500 text-sm mt-0.5">
            Adresse non précisée
          </address>
        )}
      </div>
      {o?.conformeNormesAccessibilite === "CONFORME" && (
        <p className="text-sm mt-0.5 mb-0">
          <span
            className="fr-icon-wheelchair-fill fr-icon--xs mr-3"
            aria-hidden="true"
          ></span>
          Accessibilité PMR
        </p>
      )}
    </div>
  );
};
