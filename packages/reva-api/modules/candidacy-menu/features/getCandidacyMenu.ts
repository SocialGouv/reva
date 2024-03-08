import { CandidacyMenuEntry } from "../candidacy-menu.types";
import { getCandidacyForMenu } from "./getCandidacyForMenu";
import { getActiveCandidacyMenu } from "./getActiveCandidacyMenu";
import { getDroppedOutCandidacyMenu } from "./getDroppedOutCandidacyMenu";
import { getReorientedCandidacyMenu } from "./getReorientedCandidacyMenu";
import { getDeletedCandidacyMenu } from "./getDeletedCandidacyMenu";

export const getCandidacyMenu = async ({
  candidacyId,
  userRoles,
}: {
  candidacyId: string;
  userRoles: KeyCloakUserRole[];
}): Promise<CandidacyMenuEntry[]> => {
  const candidacy = await getCandidacyForMenu({ candidacyId });
  const activeCandidacyStatus = candidacy.candidacyStatuses[0].status;

  let menu = [];

  if (candidacy.candidacyDropOut) {
    menu = await getDroppedOutCandidacyMenu({ candidacy, userRoles });
  } else if (activeCandidacyStatus === "ARCHIVE") {
    if (candidacy.reorientationReasonId !== null) {
      menu = await getReorientedCandidacyMenu({ candidacy, userRoles });
    } else {
      menu = await getDeletedCandidacyMenu({ candidacy, userRoles });
    }
  } else {
    menu = await getActiveCandidacyMenu({ candidacy, userRoles });
  }

  return menu;
};
