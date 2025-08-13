import { prismaClient } from "@/prisma/client";

import {
  CandidacyMenuEntry,
  CandidacyMenuEntryStatus,
} from "../candidacy-menu.types";

import { CandidacyForMenu } from "./getCandidacyForMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";

export const getDroppedOutCandidacyMenu = async ({
  candidacy,
}: {
  candidacy: CandidacyForMenu;
}): Promise<CandidacyMenuEntry[]> => {
  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const getDropOutMenuEntry = (): CandidacyMenuEntry => ({
    label: "Abandon du candidat",
    url: buildUrl({ suffix: "drop-out" }),
    status: "ACTIVE_WITHOUT_HINT",
  });

  const getFundingRequestMenuEntry = async (): Promise<
    CandidacyMenuEntry | undefined
  > => {
    //si le financement de la candidature est "hors plateforme", pas de page de demande de financement dans le menu
    if (candidacy.financeModule === "hors_plateforme") {
      return;
    }

    //si le financement est unireva, pas de page de financement dans le menu si la candidature n'a pas de demande de financement (on a fermé les demandes de financement)
    if (candidacy.financeModule === "unireva") {
      const fundingRequest = await prismaClient.fundingRequest.findUnique({
        where: { candidacyId: candidacy.id },
        select: { id: true },
      });

      if (!fundingRequest) {
        return;
      }
    }

    //si le financement est unifvae, pas de page de financement dans le menu si la candidature n'a pas de demande de financement (on a fermé les demandes de financement)
    if (candidacy.financeModule === "unifvae") {
      const fundingRequestUnifvae =
        await prismaClient.fundingRequestUnifvae.findFirst({
          where: { candidacyId: candidacy.id },
          select: { id: true },
        });

      if (!fundingRequestUnifvae) {
        return;
      }
    }

    return {
      label: "Demande de prise en charge",
      url: buildUrl({
        suffix: "funding",
      }),
      status: "ACTIVE_WITHOUT_HINT",
    };
  };

  const getPaymentRequestMenuEntry = async (): Promise<
    CandidacyMenuEntry | undefined
  > => {
    if (candidacy.financeModule === "hors_plateforme") {
      return undefined;
    }

    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";

    // il faut qu'une demande de financement ait été faite pour débloquer la demande de paiement
    if (
      (candidacy.financeModule === "unireva" &&
        candidacy.FundingRequest !== null) ||
      (candidacy.financeModule === "unifvae" &&
        candidacy.fundingRequestUnifvae !== null)
    ) {
      menuEntryStatus = "ACTIVE_WITHOUT_HINT";
    }

    const isCandidacyUniReva = candidacy.financeModule === "unireva";

    const paymentPageUrl = isCandidacyUniReva
      ? buildUrl({
          suffix: "payment/unireva/invoice",
        })
      : buildUrl({
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
