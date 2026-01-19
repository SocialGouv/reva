import { CandidateTypology } from "@/graphql/generated/graphql";

export const AVAILABLE_CANDIDATE_TYPOLOGIES = [
  "SALARIE_PRIVE",
  "BENEVOLE",
  "AIDANTS_FAMILIAUX",
  "AIDANTS_FAMILIAUX_AGRICOLES",
  "DEMANDEUR_EMPLOI",
  "TRAVAILLEUR_NON_SALARIE",
  "RETRAITE",
  "TITULAIRE_MANDAT_ELECTIF",
  "AUTRE",
] as const;

export const getTypologyLabel = (typology?: CandidateTypology) => {
  switch (typology) {
    case "SALARIE_PRIVE":
      return "Salarié du privé";
    case "BENEVOLE":
      return "Bénévole";
    case "AIDANTS_FAMILIAUX":
      return "Aidant familial";
    case "AIDANTS_FAMILIAUX_AGRICOLES":
      return "Aidant familial agricole";
    case "DEMANDEUR_EMPLOI":
      return "Demandeur d'emploi";
    case "TRAVAILLEUR_NON_SALARIE":
      return "Travailleur non salarié";
    case "RETRAITE":
      return "Retraité";
    case "TITULAIRE_MANDAT_ELECTIF":
      return "Titulaire d’un mandat électif (électoral ou syndical)";
    case "AUTRE":
      return "Autre";
    default:
      return typology;
  }
};
