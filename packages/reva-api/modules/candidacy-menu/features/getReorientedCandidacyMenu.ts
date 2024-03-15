import { format } from "date-fns";
import { CandidacyMenuEntry } from "../candidacy-menu.types";
import { CandidacyForMenu } from "./getCandidacyForMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";

export const getReorientedCandidacyMenu = async ({
  candidacy,
}: {
  candidacy: CandidacyForMenu;
}): Promise<CandidacyMenuEntry[]> => {
  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const getReorientedCandidacyMenuEntry = (): CandidacyMenuEntry => ({
    label: `Réorientée le ${format(candidacy.candidacyStatuses[0].createdAt, "d MMMM yyyy")}`,
    url: buildUrl({ adminType: "Elm", suffix: "archive" }),
    status: "ACTIVE_WITHOUT_HINT",
  });

  return [getReorientedCandidacyMenuEntry()];
};
