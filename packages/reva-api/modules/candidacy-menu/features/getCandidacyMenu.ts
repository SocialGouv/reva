import { CandidacyMenu, CandidacyMenuEntry } from "../candidacy-menu.types";
import { getCandidacyForMenu } from "./getCandidacyForMenu";
import { getActiveCandidacyMenu } from "./getActiveCandidacyMenu";
import { getDroppedOutCandidacyMenu } from "./getDroppedOutCandidacyMenu";
import { getReorientedCandidacyMenu } from "./getReorientedCandidacyMenu";
import { getDeletedCandidacyMenu } from "./getDeletedCandidacyMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const getCandidacyMenu = async ({
  candidacyId,
  userKeycloakId,
  userRoles,
}: {
  candidacyId: string;
  userKeycloakId?: string;
  userRoles: KeyCloakUserRole[];
}): Promise<CandidacyMenu> => {
  const candidacy = await getCandidacyForMenu({ candidacyId });
  const activeCandidacyStatus = candidacy.candidacyStatuses[0].status;

  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const menuHeader: CandidacyMenuEntry[] = (await isFeatureActiveForUser({
    userKeycloakId,
    feature: "NEW_CANDIDACY_SUMMARY_PAGE",
  }))
    ? [
        {
          label: "Résumé de la candidature",
          status: "ACTIVE_WITHOUT_HINT",
          url: buildUrl({ adminType: "React", suffix: "summary" }),
        },
      ]
    : [];

  const menuFooter: CandidacyMenuEntry[] = userRoles.includes("admin")
    ? [
        {
          label: "Journal des actions",
          url: buildUrl({ adminType: "React", suffix: "logs" }),
          status: "ACTIVE_WITHOUT_HINT",
        },
      ]
    : [];

  let mainMenu: CandidacyMenuEntry[] = [];

  if (candidacy.candidacyDropOut) {
    mainMenu = await getDroppedOutCandidacyMenu({ candidacy });
  } else if (activeCandidacyStatus === "ARCHIVE") {
    if (candidacy.reorientationReasonId !== null) {
      mainMenu = await getReorientedCandidacyMenu({ candidacy });
    } else {
      mainMenu = await getDeletedCandidacyMenu({ candidacy });
    }
  } else {
    mainMenu = await getActiveCandidacyMenu({ candidacy });
  }

  return { menuHeader, mainMenu, menuFooter };
};
