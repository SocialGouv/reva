import { CandidacyMenu, CandidacyMenuEntry } from "../candidacy-menu.types";
import { getCandidacyForMenu } from "./getCandidacyForMenu";
import { getActiveCandidacyMenu } from "./getActiveCandidacyMenu";
import { getDroppedOutCandidacyMenu } from "./getDroppedOutCandidacyMenu";
import { getReorientedCandidacyMenu } from "./getReorientedCandidacyMenu";
import { getDeletedCandidacyMenu } from "./getDeletedCandidacyMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";

export const getCandidacyMenu = async ({
  candidacyId,
  userRoles,
}: {
  candidacyId: string;
  userRoles: KeyCloakUserRole[];
}): Promise<CandidacyMenu> => {
  const candidacy = await getCandidacyForMenu({ candidacyId });
  const activeCandidacyStatus = candidacy.candidacyStatuses[0].status;

  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const menuHeader: CandidacyMenuEntry[] = [
    {
      label: "Résumé de la candidature",
      status: "ACTIVE_WITHOUT_HINT",
      url: buildUrl({ adminType: "React", suffix: "summary" }),
    },
  ];

  let mainMenu: CandidacyMenuEntry[] = [];

  if (candidacy.candidacyDropOut) {
    mainMenu = await getDroppedOutCandidacyMenu({ candidacy, userRoles });
  } else if (activeCandidacyStatus === "ARCHIVE") {
    if (candidacy.reorientationReasonId !== null) {
      mainMenu = await getReorientedCandidacyMenu({ candidacy, userRoles });
    } else {
      mainMenu = await getDeletedCandidacyMenu({ candidacy, userRoles });
    }
  } else {
    mainMenu = await getActiveCandidacyMenu({ candidacy, userRoles });
  }

  return { menuHeader, mainMenu };
};
