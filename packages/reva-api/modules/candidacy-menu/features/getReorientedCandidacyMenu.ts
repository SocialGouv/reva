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

  let deletedAt: Date | undefined;

  if (candidacy.status === "ARCHIVE") {
    deletedAt = candidacy.candidacyStatuses.find(
      (s) => s.status === "ARCHIVE",
    )?.createdAt;
  }

  const getReorientedCandidacyMenuEntry = (): CandidacyMenuEntry => ({
    label: deletedAt
      ? `Réorientée le ${format(deletedAt, "d MMMM yyyy")}`
      : "Réorientée",
    url: buildUrl({ suffix: "archive" }),
    status: "ACTIVE_WITHOUT_HINT",
  });

  return [getReorientedCandidacyMenuEntry()];
};
