import { format } from "date-fns";
import { CandidacyMenuEntry } from "../candidacy-menu.types";
import { CandidacyForMenu } from "./getCandidacyForMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";

export const getDeletedCandidacyMenu = async ({
  candidacy,
}: {
  candidacy: CandidacyForMenu;
}): Promise<CandidacyMenuEntry[]> => {
  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const getDeletedCandidacyMenuEntry = (): CandidacyMenuEntry => ({
    label: `Supprimée le ${format(candidacy.candidacyStatuses[0].createdAt, "d MMMM yyyy")}`,
    url: buildUrl({ adminType: "Elm", suffix: "archive" }),
    status: "ACTIVE_WITHOUT_HINT",
  });

  return [getDeletedCandidacyMenuEntry()];
};
