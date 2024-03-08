import { format } from "date-fns";
import { CandidacyMenuEntry } from "../candidacy-menu.types";
import { CandidacyForMenu } from "./getCandidacyForMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";

export const getReorientedCandidacyMenu = async ({
  candidacy,
  userRoles,
}: {
  candidacy: CandidacyForMenu;
  userRoles: KeyCloakUserRole[];
}): Promise<CandidacyMenuEntry[]> => {
  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const getReorientedCandidacyMenuEntry = (): CandidacyMenuEntry => ({
    label: `Réorientée le ${format(candidacy.candidacyStatuses[0].createdAt, "d MMMM yyyy")}`,
    url: buildUrl({ adminType: "Elm", suffix: "archive" }),
    status: "ACTIVE_WITHOUT_HINT",
  });

  const getCandidacyLogMenuEntry = (): CandidacyMenuEntry | undefined =>
    userRoles.includes("admin")
      ? {
          label: "Journal des actions",
          url: buildUrl({ adminType: "React", suffix: "logs" }),
          status: "ACTIVE_WITHOUT_HINT",
        }
      : undefined;

  return [getReorientedCandidacyMenuEntry(), getCandidacyLogMenuEntry()].filter(
    (e) => e,
  ) as CandidacyMenuEntry[];
};
