import { isUserOwnerOfOrganism } from "../features/isUserOwnerOfOrganism";

import { organismByIdArg } from "./organismByIdArg.security";

export const isOwnerOfOrganismByIdArg = organismByIdArg(isUserOwnerOfOrganism);
