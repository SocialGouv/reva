import { OrganismInformationsCommerciales } from "../../../interface";

export const OrganismCardInformationsCommerciales = ({
  informationsCommerciales: ic,
}: {
  informationsCommerciales: OrganismInformationsCommerciales;
}) => {
  return (
    <>
      <div>
        <p>{ic.adresseNumeroEtNomDeRue}</p>
        <p> {ic.adresseInformationsComplementaires}</p>
        <p>
          {ic.adresseVille} - {ic.adresseCodePostal}
        </p>
      </div>
      {ic.conformeNormesAccessbilite === "CONFORME" && <p>Accessibilité PMR</p>}
    </>
  );
};
