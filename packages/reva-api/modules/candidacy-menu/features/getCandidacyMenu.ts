import { Candidate } from "../../candidate/candidate.types";
import { CandidacyMenu, CandidacyMenuEntry } from "../candidacy-menu.types";

import { getActiveCandidacyMenu } from "./getActiveCandidacyMenu";
import { getCandidacyForMenu } from "./getCandidacyForMenu";
import { getDeletedCandidacyMenu } from "./getDeletedCandidacyMenu";
import { getDroppedOutCandidacyMenu } from "./getDroppedOutCandidacyMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";
import { getReorientedCandidacyMenu } from "./getReorientedCandidacyMenu";

const checkCandidateFields = (object: any, fields: (keyof Candidate)[]) => {
  return fields.every((field) => object[field]);
};

export const getCandidacyMenu = async ({
  candidacyId,
  userRoles,
}: {
  candidacyId: string;
  userRoles: KeyCloakUserRole[];
}): Promise<CandidacyMenu> => {
  const candidacy = await getCandidacyForMenu({ candidacyId });
  const activeCandidacyStatus = candidacy.status;
  const candidate = candidacy.candidate;

  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const isCandidateSummaryComplete = checkCandidateFields(candidate, [
    "firstname",
    "lastname",
    "phone",
    "email",
    "birthdate",
    "birthCity",
    "nationality",
    "street",
    "zip",
    "city",
    "countryId",
    "departmentId",
    "highestDegreeId",
    "niveauDeFormationLePlusEleveDegreeId",
  ]);

  const menuHeader: CandidacyMenuEntry[] = [
    {
      label: "Résumé de la candidature",
      status:
        isCandidateSummaryComplete ||
        candidacy.feasibilityFormat === "UPLOADED_PDF"
          ? "ACTIVE_WITHOUT_HINT"
          : "ACTIVE_WITH_EDIT_HINT",
      url: buildUrl({ suffix: "summary" }),
    },
  ];

  const menuFooter: CandidacyMenuEntry[] = userRoles.includes("admin")
    ? [
        {
          label: "Journal des actions",
          url: buildUrl({ suffix: "logs" }),
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
    mainMenu = await getActiveCandidacyMenu({
      candidacy,
      isCandidateSummaryComplete,
    });
  }

  return { menuHeader, mainMenu, menuFooter };
};
