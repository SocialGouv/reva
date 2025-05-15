import { CandidacyStatusStep } from "@prisma/client";

import { getCandidacyHasConfirmedCaducite } from "../../candidacy/features/getCandidacyHasConfirmedCaducite";
import { getCandidacyIsCaduque } from "../../candidacy/features/getCandidacyIsCaduque";
import {
  CandidacyMenuEntry,
  CandidacyMenuEntryStatus,
} from "../candidacy-menu.types";
import { CandidacyForMenu } from "./getCandidacyForMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";
import { isCandidacyStatusEqualOrAboveGivenStatus } from "./isCandidacyStatusEqualOrAboveGivenStatus";
import { prismaClient } from "../../../prisma/client";

export const getActiveCandidacyMenu = async ({
  candidacy,
  isCandidateSummaryComplete,
}: {
  candidacy: CandidacyForMenu;
  isCandidateSummaryComplete: boolean;
}) => {
  const activeCandidacyStatus = candidacy.candidacyStatuses.find(
    (status) => status.isActive,
  )?.status as CandidacyStatusStep;

  const isStatusEqualOrAbove = isCandidacyStatusEqualOrAboveGivenStatus(
    activeCandidacyStatus,
  );

  let candidacyHasConfirmedCaducite = false;

  const candidacyIsCaduque = await getCandidacyIsCaduque({
    candidacyId: candidacy.id,
  });

  if (candidacyIsCaduque) {
    candidacyHasConfirmedCaducite = await getCandidacyHasConfirmedCaducite({
      candidacyId: candidacy.id,
    });
  }

  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const hasAlreadyAppointment = !!candidacy.firstAppointmentOccuredAt;

  const getMeetingsMenuEntry = (): CandidacyMenuEntry => ({
    label: "Rendez-vous pédagogique",
    url: buildUrl({ suffix: "meetings" }),
    status:
      activeCandidacyStatus === "PRISE_EN_CHARGE" && !hasAlreadyAppointment
        ? "ACTIVE_WITH_EDIT_HINT"
        : "ACTIVE_WITHOUT_HINT",
  });

  const getTrainingValidationMenuEntry = (): CandidacyMenuEntry => ({
    label: "Validation du parcours",
    url: "#",
    status: "INACTIVE",
  });

  const getTrainingMenuEntry = (): CandidacyMenuEntry => {
    let trainingUrl = "#";
    let menuEntryStatus: CandidacyMenuEntryStatus =
      activeCandidacyStatus === "PRISE_EN_CHARGE" && hasAlreadyAppointment
        ? "ACTIVE_WITH_EDIT_HINT"
        : "ACTIVE_WITHOUT_HINT";

    if (candidacy.ccnId) {
      trainingUrl = buildUrl({
        suffix: "training",
      });
    } else if (candidacy.firstAppointmentOccuredAt) {
      trainingUrl = buildUrl({
        suffix: "typology",
      });
    } else {
      menuEntryStatus = "INACTIVE";
    }
    return {
      label: "Définition du parcours",
      url: trainingUrl,
      status: menuEntryStatus,
    };
  };

  const getFeasibilityMenuEntry = async ({
    feasibilityFormat,
    isCandidateSummaryComplete,
  }: {
    feasibilityFormat: "UPLOADED_PDF" | "DEMATERIALIZED";
    isCandidateSummaryComplete: boolean;
  }): Promise<CandidacyMenuEntry | undefined> => {
    const activeFeasibility = candidacy.Feasibility.find((f) => f.isActive);

    const showFeasibilityEntry =
      candidacy.organism?.typology !== "experimentation";

    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";
    const editableStatus: CandidacyStatusStep[] = [
      "PARCOURS_CONFIRME",
      "DOSSIER_FAISABILITE_INCOMPLET",
    ];
    const editableFeasibilityDecisions = ["DRAFT", "INCOMPLETE"];
    const feasibilityDecision = activeFeasibility?.decision ?? "";
    const isDfDematerialized = feasibilityFormat === "DEMATERIALIZED";
    const isActiveWithEditHint =
      editableStatus.includes(activeCandidacyStatus) &&
      (!activeFeasibility ||
        editableFeasibilityDecisions.includes(feasibilityDecision));

    if (isDfDematerialized && !isCandidateSummaryComplete) {
      menuEntryStatus = "INACTIVE";
    } else if (isActiveWithEditHint) {
      menuEntryStatus = "ACTIVE_WITH_EDIT_HINT";
    } else if (isStatusEqualOrAbove("PARCOURS_CONFIRME")) {
      menuEntryStatus = "ACTIVE_WITHOUT_HINT";
    } else {
      menuEntryStatus = "INACTIVE";
    }

    let url = "#";

    if (isStatusEqualOrAbove("PARCOURS_CONFIRME")) {
      url = isDfDematerialized
        ? buildUrl({ suffix: "feasibility-aap" })
        : buildUrl({ suffix: "feasibility-aap/pdf" });
    }

    return showFeasibilityEntry
      ? {
          label: "Dossier de faisabilité",
          url,
          status: menuEntryStatus,
        }
      : undefined;
  };

  const getFundingRequestMenuEntry = async (): Promise<
    CandidacyMenuEntry | undefined
  > => {
    //pas de page de demande de financemnt si le financement de la candidature est "hors plateforme"
    if (candidacy.financeModule === "hors_plateforme") {
      return;
    }

    const fundingRequest = await prismaClient.fundingRequest.findUnique({
      where: { candidacyId: candidacy.id },
      select: { id: true },
    });

    if (!fundingRequest) {
      return;
    }

    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";

    if (candidacy.financeModule === "unireva") {
      if (isStatusEqualOrAbove("PARCOURS_CONFIRME")) {
        menuEntryStatus = "ACTIVE_WITHOUT_HINT";
      }
    } else if (candidacy.financeModule === "unifvae") {
      if (isStatusEqualOrAbove("DOSSIER_FAISABILITE_RECEVABLE")) {
        const editableStatus: CandidacyStatusStep[] = [
          "DOSSIER_FAISABILITE_RECEVABLE",
          "DOSSIER_FAISABILITE_NON_RECEVABLE",
        ];
        if (editableStatus.includes(activeCandidacyStatus)) {
          menuEntryStatus = "ACTIVE_WITH_EDIT_HINT";
        } else {
          menuEntryStatus = "ACTIVE_WITHOUT_HINT";
        }
      }
    }
    return {
      label: "Demande de prise en charge",
      url: buildUrl({
        suffix: "funding",
      }),
      status: menuEntryStatus,
    };
  };

  const getDossierDeValidationMenuEntry = (): CandidacyMenuEntry => {
    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";

    const activeFeasibility = candidacy.Feasibility.find((f) => f.isActive);
    let url = "#";

    if (activeFeasibility?.decision === "ADMISSIBLE") {
      const editableStatus: CandidacyStatusStep[] =
        candidacy.financeModule === "hors_plateforme"
          ? [
              "DOSSIER_FAISABILITE_RECEVABLE",
              "DOSSIER_FAISABILITE_NON_RECEVABLE",
              "DOSSIER_DE_VALIDATION_SIGNALE",
            ]
          : ["DEMANDE_FINANCEMENT_ENVOYE", "DOSSIER_DE_VALIDATION_SIGNALE"];

      const isCandidacyStatusAdvancedEnoughToEditDossierDeValidation =
        isCandidacyStatusEqualOrAboveGivenStatus(activeCandidacyStatus);

      if (
        editableStatus.some((s) =>
          isCandidacyStatusAdvancedEnoughToEditDossierDeValidation(s),
        ) &&
        !candidacyIsCaduque
      ) {
        menuEntryStatus = editableStatus.includes(activeCandidacyStatus)
          ? "ACTIVE_WITH_EDIT_HINT"
          : "ACTIVE_WITHOUT_HINT";
      }

      url = buildUrl({
        suffix: "dossier-de-validation-aap",
      });
    }
    return {
      label: "Dossier de validation",
      url,
      status: menuEntryStatus,
    };
  };

  const getPaymentRequestMenuEntry = async (): Promise<
    CandidacyMenuEntry | undefined
  > => {
    //pas de page de demande de paiement si le financement de la candidature est "hors plateforme"

    if (candidacy.financeModule === "hors_plateforme") {
      return undefined;
    }

    const activeFeasibility = candidacy.Feasibility.find((f) => f.isActive);

    const minimumStatusForPaymentRequest: CandidacyStatusStep =
      candidacy.financeModule !== "unireva" &&
      activeFeasibility?.decision !== "REJECTED"
        ? "DOSSIER_DE_VALIDATION_ENVOYE"
        : "DEMANDE_FINANCEMENT_ENVOYE";

    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";

    if (
      isStatusEqualOrAbove(minimumStatusForPaymentRequest) ||
      candidacyHasConfirmedCaducite
    ) {
      menuEntryStatus =
        activeCandidacyStatus === minimumStatusForPaymentRequest
          ? "ACTIVE_WITH_EDIT_HINT"
          : "ACTIVE_WITHOUT_HINT";
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

  const getJuryMenuEntry = (): CandidacyMenuEntry => {
    const showNewJuryMenu =
      candidacy.financeModule == "unifvae" ||
      candidacy.financeModule === "hors_plateforme";

    const minumumStatusToShowJuryMenu =
      candidacy.financeModule === "hors_plateforme"
        ? "DOSSIER_FAISABILITE_RECEVABLE"
        : "DEMANDE_FINANCEMENT_ENVOYE";

    const menuEntryStatus: CandidacyMenuEntryStatus = isStatusEqualOrAbove(
      minumumStatusToShowJuryMenu,
    )
      ? "ACTIVE_WITHOUT_HINT"
      : "INACTIVE";

    return showNewJuryMenu
      ? {
          label: "Jury",
          url: buildUrl({ suffix: "jury-aap" }),
          status: menuEntryStatus,
        }
      : {
          label: "Jury",
          url: buildUrl({ suffix: "exam-info" }),
          status: menuEntryStatus,
        };
  };

  return [
    getMeetingsMenuEntry(),
    getTrainingMenuEntry(),
    getTrainingValidationMenuEntry(),
    await getFeasibilityMenuEntry({
      feasibilityFormat: candidacy.feasibilityFormat,
      isCandidateSummaryComplete,
    }),
    await getFundingRequestMenuEntry(),
    getDossierDeValidationMenuEntry(),
    await getPaymentRequestMenuEntry(),
    getJuryMenuEntry(),
  ].filter((e) => e) as CandidacyMenuEntry[];
};
