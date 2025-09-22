import { RNCPCertification } from "../rncp/referential";

export const getLevelFromRNCPCertification = (
  certification: RNCPCertification,
): number => {
  try {
    const strLevel =
      certification.NOMENCLATURE_EUROPE?.INTITULE.split(" ").reverse()[0] || "";
    const level = parseInt(strLevel, 10);
    return level;
  } catch {
    throw new Error(
      `Le niveau de la certification pour le code RNCP ${certification.ID_FICHE} n'a pas pu être formaté`,
    );
  }
};
