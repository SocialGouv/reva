import { CandidacyStatusStep } from "@prisma/client";
import {
  CandidacyMenuEntry,
  CandidacyMenuEntryStatus,
} from "../candidacy-menu.types";
import { CandidacyForMenu } from "./getCandidacyForMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";
import { isCandidacyStatusEqualOrAboveGivenStatus } from "./isCandidacyStatusEqualOrAboveGivenStatus";

export const getDroppedOutCandidacyMenu = async ({
  candidacy,
}: {
  candidacy: CandidacyForMenu;
}): Promise<CandidacyMenuEntry[]> => {
  const activeCandidacyStatus = candidacy.candidacyStatuses[0].status;

  const isStatusEqualOrAbove = isCandidacyStatusEqualOrAboveGivenStatus(
    activeCandidacyStatus,
  );

  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const getDropOutMenuEntry = (): CandidacyMenuEntry => ({
    label: "Abandon du candidat confirmé",
    url: buildUrl({ adminType: "Elm", suffix: "drop-out" }),
    status: "ACTIVE_WITHOUT_HINT",
  });

  const getFundingRequestMenuEntry = (): CandidacyMenuEntry => {
    const editableStatus: CandidacyStatusStep[] = [
      "DOSSIER_FAISABILITE_RECEVABLE",
      "DOSSIER_FAISABILITE_NON_RECEVABLE",
      "DOSSIER_FAISABILITE_INCOMPLET",
    ];
    return {
      label: "Demande de prise en charge",
      url: buildUrl({ adminType: "Elm", suffix: "funding" }),
      status: editableStatus.includes(activeCandidacyStatus)
        ? "ACTIVE_WITH_EDIT_HINT"
        : "ACTIVE_WITHOUT_HINT",
    };
  };

  const getPaymentRequestMenuEntry = (): CandidacyMenuEntry => {
    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";

    if (isStatusEqualOrAbove("DEMANDE_FINANCEMENT_ENVOYE")) {
      menuEntryStatus =
        activeCandidacyStatus === "DEMANDE_FINANCEMENT_ENVOYE"
          ? "ACTIVE_WITH_EDIT_HINT"
          : "ACTIVE_WITHOUT_HINT";
    }

    return {
      label: "Demande de paiement",
      url: buildUrl({ adminType: "Elm", suffix: "payment" }),
      status: menuEntryStatus,
    };
  };

  return [
    getDropOutMenuEntry(),
    getFundingRequestMenuEntry(),
    getPaymentRequestMenuEntry(),
  ];
};
