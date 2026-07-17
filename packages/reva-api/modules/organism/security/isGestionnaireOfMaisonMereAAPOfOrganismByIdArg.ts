import { isUserGestionnaireMaisonMereAAPOfOrganism } from "../features/isUserGestionnaireMaisonMereAAPOfOrganism";

import { organismByIdArg } from "./organismByIdArg.security";

export const isGestionnaireOfMaisonMereAAPOfOrganismByIdArg = organismByIdArg(
  isUserGestionnaireMaisonMereAAPOfOrganism,
);
