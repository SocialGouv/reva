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
  const activeCandidacyStatus = candidacy.candidacyStatuses.find(
    ({ isActive }) => isActive,
  )?.status;

  const isStatusEqualOrAbove = isCandidacyStatusEqualOrAboveGivenStatus(
    activeCandidacyStatus as CandidacyStatusStep,
  );

  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const getDropOutMenuEntry = (): CandidacyMenuEntry => ({
    label: "Abandon du candidat confirmé",
    url: buildUrl({ adminType: "React", suffix: "drop-out" }),
    status: "ACTIVE_WITHOUT_HINT",
  });

  const getFundingRequestMenuEntry = async (): Promise<
    CandidacyMenuEntry | undefined
  > => {
    if (candidacy.financeModule === "hors_plateforme") {
      return undefined;
    }

    const editableStatus: CandidacyStatusStep[] = [
      "DOSSIER_FAISABILITE_RECEVABLE",
      "DOSSIER_FAISABILITE_NON_RECEVABLE",
      "DOSSIER_FAISABILITE_INCOMPLET",
    ];
    return {
      label: "Demande de prise en charge",
      url: buildUrl({
        adminType: "React",
        suffix: "funding",
      }),
      status: editableStatus.includes(
        activeCandidacyStatus as CandidacyStatusStep,
      )
        ? "ACTIVE_WITH_EDIT_HINT"
        : "ACTIVE_WITHOUT_HINT",
    };
  };

  const getPaymentRequestMenuEntry = async (): Promise<
    CandidacyMenuEntry | undefined
  > => {
    if (candidacy.financeModule === "hors_plateforme") {
      return undefined;
    }

    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";

    if (isStatusEqualOrAbove("DEMANDE_FINANCEMENT_ENVOYE")) {
      menuEntryStatus =
        activeCandidacyStatus === "DEMANDE_FINANCEMENT_ENVOYE"
          ? "ACTIVE_WITH_EDIT_HINT"
          : "ACTIVE_WITHOUT_HINT";
    }

    const isCandidacyUniReva = candidacy.financeModule === "unireva";

    const paymentPageUrl = isCandidacyUniReva
      ? buildUrl({
          adminType: "React",
          suffix: "payment/unireva/invoice",
        })
      : buildUrl({
          adminType: "React",
          suffix: "payment/unifvae/invoice",
        });

    return {
      label: "Demande de paiement",
      url: paymentPageUrl,
      status: menuEntryStatus,
    };
  };

  const droppedOutCandidacyMenu = [getDropOutMenuEntry()];
  const candidacyHasSentFeasibilityRequest = candidacy.candidacyStatuses.find(
    ({ status }) => status === "DOSSIER_FAISABILITE_ENVOYE",
  );
  const candidacyIsUnireva = candidacy.financeModule === "unireva";

  if (candidacyHasSentFeasibilityRequest || candidacyIsUnireva) {
    const fundingRequestMenuEntry = await getFundingRequestMenuEntry();
    if (fundingRequestMenuEntry) {
      droppedOutCandidacyMenu.push(fundingRequestMenuEntry);
    }

    const paymentRequestMenuEntry = await getPaymentRequestMenuEntry();
    if (paymentRequestMenuEntry) {
      droppedOutCandidacyMenu.push(paymentRequestMenuEntry);
    }
  }

  return droppedOutCandidacyMenu;
};
