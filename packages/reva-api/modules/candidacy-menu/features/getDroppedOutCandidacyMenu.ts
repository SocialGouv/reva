import { CandidacyStatusStep } from "@prisma/client";

import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";
import {
  CandidacyMenuEntry,
  CandidacyMenuEntryStatus,
} from "../candidacy-menu.types";
import { CandidacyForMenu } from "./getCandidacyForMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";
import { isCandidacyStatusEqualOrAboveGivenStatus } from "./isCandidacyStatusEqualOrAboveGivenStatus";

export const getDroppedOutCandidacyMenu = async ({
  candidacy,
  userKeycloakId,
}: {
  candidacy: CandidacyForMenu;
  userKeycloakId?: string;
}): Promise<CandidacyMenuEntry[]> => {
  const activeCandidacyStatus = candidacy.candidacyStatuses.find(
    ({ isActive }) => isActive,
  )?.status;

  const isStatusEqualOrAbove = isCandidacyStatusEqualOrAboveGivenStatus(
    activeCandidacyStatus as CandidacyStatusStep,
  );

  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const getDropOutMenuEntry = (): CandidacyMenuEntry => ({
    label: "Abandon du candidat confirmé",
    url: buildUrl({ adminType: "Elm", suffix: "drop-out" }),
    status: "ACTIVE_WITHOUT_HINT",
  });

  const getFundingRequestMenuEntry = async (
    userKeycloakId?: string,
  ): Promise<CandidacyMenuEntry> => {
    const isReactFundingPageActive = await isFeatureActiveForUser({
      userKeycloakId,
      feature: "REACT_FUNDING_PAGE",
    });
    const editableStatus: CandidacyStatusStep[] = [
      "DOSSIER_FAISABILITE_RECEVABLE",
      "DOSSIER_FAISABILITE_NON_RECEVABLE",
      "DOSSIER_FAISABILITE_INCOMPLET",
    ];
    return {
      label: "Demande de prise en charge",
      url: buildUrl({
        adminType: isReactFundingPageActive ? "React" : "Elm",
        suffix: "funding",
      }),
      status: editableStatus.includes(
        activeCandidacyStatus as CandidacyStatusStep,
      )
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

  const droppedOutCandidacyMenu = [getDropOutMenuEntry()];
  const candidacyHasSentFeasibilityRequest = candidacy.candidacyStatuses.find(
    ({ status }) => status === "DOSSIER_FAISABILITE_ENVOYE",
  );
  const candidacyIsUnireva = candidacy.financeModule === "unireva";

  if (candidacyHasSentFeasibilityRequest || candidacyIsUnireva) {
    const fundingRequestMenuEntry =
      await getFundingRequestMenuEntry(userKeycloakId);
    const paymentRequestMenuEntry = getPaymentRequestMenuEntry();

    droppedOutCandidacyMenu.push(
      ...[fundingRequestMenuEntry, paymentRequestMenuEntry],
    );
  }

  return droppedOutCandidacyMenu;
};
