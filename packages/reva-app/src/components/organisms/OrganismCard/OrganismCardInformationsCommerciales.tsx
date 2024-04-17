import { OrganismInformationsCommerciales } from "../../../interface";

export const OrganismCardInformationsCommerciales = ({
  informationsCommerciales: ic,
}: {
  informationsCommerciales?: OrganismInformationsCommerciales;
}) => {
  return (
    <div>
      <div className="flex gap-x-2">
        <span
          className="fr-icon-home-4-line fr-icon--sm"
          aria-hidden="true"
        ></span>
        {ic &&
        (ic.adresseNumeroEtNomDeRue ||
          ic.adresseInformationsComplementaires ||
          ic.adresseCodePostal ||
          ic.adresseVille) ? (
          <address className="not-italic">
            {ic.adresseNumeroEtNomDeRue}
            {ic.adresseNumeroEtNomDeRue && <br />}
            {ic.adresseInformationsComplementaires}
            {ic.adresseInformationsComplementaires && <br />}
            {ic.adresseCodePostal} {ic.adresseVille}
          </address>
        ) : (
          <address className="text-gray-500 text-sm mt-0.5">
            Adresse non précisée
          </address>
        )}
      </div>
      {ic?.conformeNormesAccessbilite === "CONFORME" && (
        <p className="text-sm mt-0.5">
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
