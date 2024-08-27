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

  const deletedAt = candidacy.candidacyStatuses.find(
    (s) => s.status === "ARCHIVE" && s.isActive,
  )?.createdAt;

  const getDeletedCandidacyMenuEntry = (): CandidacyMenuEntry => ({
    label: deletedAt
      ? `Supprimée le ${format(deletedAt, "d MMMM yyyy")}`
      : "Supprimée",
    url: buildUrl({ suffix: "archive" }),
    status: "ACTIVE_WITHOUT_HINT",
  });

  return [getDeletedCandidacyMenuEntry()];
};
