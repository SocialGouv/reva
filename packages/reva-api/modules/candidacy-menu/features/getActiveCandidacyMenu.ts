import { CandidacyStatusStep } from "@prisma/client";
import {
  CandidacyMenuEntry,
  CandidacyMenuEntryStatus,
} from "../candidacy-menu.types";
import { CandidacyForMenu } from "./getCandidacyForMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";
import { isCandidacyStatusEqualOrAboveGivenStatus } from "./isCandidacyStatusEqualOrAboveGivenStatus";

export const getActiveCandidacyMenu = async ({
  candidacy,
}: {
  candidacy: CandidacyForMenu;
}) => {
  const activeCandidacyStatus = candidacy.candidacyStatuses[0].status;

  const isStatusEqualOrAbove = isCandidacyStatusEqualOrAboveGivenStatus(
    activeCandidacyStatus,
  );

  const buildUrl = menuUrlBuilder({ candidacyId: candidacy.id });

  const getMeetingsMenuEntry = (): CandidacyMenuEntry => ({
    label: "Rendez-vous pédagogique",
    url: buildUrl({ adminType: "React", suffix: "meetings" }),
    status:
      activeCandidacyStatus === "PRISE_EN_CHARGE"
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
      activeCandidacyStatus === "PRISE_EN_CHARGE" &&
      candidacy.firstAppointmentOccuredAt !== null
        ? "ACTIVE_WITH_EDIT_HINT"
        : "ACTIVE_WITHOUT_HINT";

    if (candidacy.ccnId) {
      trainingUrl = buildUrl({
        adminType: "Elm",
        suffix: "training",
      });
    } else if (candidacy.firstAppointmentOccuredAt) {
      trainingUrl = buildUrl({
        adminType: "Elm",
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

  const getAdmissibilityMenuEntry = (): CandidacyMenuEntry | undefined => {
    const showAdmissibilityEntry =
      candidacy.organism?.typology === "experimentation";

    const menuEntryStatus: CandidacyMenuEntryStatus =
      activeCandidacyStatus === "PARCOURS_CONFIRME"
        ? "ACTIVE_WITH_EDIT_HINT"
        : "ACTIVE_WITHOUT_HINT";

    return showAdmissibilityEntry
      ? {
          label: "Gestion de la recevabilité",
          url: buildUrl({ adminType: "Elm", suffix: "admissibility" }),
          status: menuEntryStatus,
        }
      : undefined;
  };

  const getFeasibilityMenuEntry = (): CandidacyMenuEntry | undefined => {
    const activeFeasibility = candidacy.Feasibility.find((f) => f.isActive);

    const showFeasibilityEntry =
      candidacy.organism?.typology !== "experimentation";

    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";
    if (isStatusEqualOrAbove("PARCOURS_CONFIRME")) {
      const editableStatus: CandidacyStatusStep[] = [
        "PARCOURS_CONFIRME",
        "DOSSIER_FAISABILITE_INCOMPLET",
      ];
      if (
        (editableStatus.includes(activeCandidacyStatus) &&
          !activeFeasibility) ||
        activeFeasibility?.decision === "INCOMPLETE"
      ) {
        menuEntryStatus = "ACTIVE_WITH_EDIT_HINT";
      } else {
        menuEntryStatus = "ACTIVE_WITHOUT_HINT";
      }

      return showFeasibilityEntry
        ? {
            label: "Dossier de faisabilité",
            url: buildUrl({ adminType: "Elm", suffix: "feasibility" }),
            status: menuEntryStatus,
          }
        : undefined;
    }
  };

  const getFundingRequestMenuEntry = (): CandidacyMenuEntry => {
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
      url: buildUrl({ adminType: "Elm", suffix: "funding" }),
      status: menuEntryStatus,
    };
  };

  const getDossierDeValidationMenuEntry = (): CandidacyMenuEntry => {
    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";

    const activeFeasibility = candidacy.Feasibility.find((f) => f.isActive);
    let url = "#";

    if (activeFeasibility?.decision === "ADMISSIBLE") {
      const editableStatus: CandidacyStatusStep[] = [
        "DEMANDE_FINANCEMENT_ENVOYE",
        "DOSSIER_DE_VALIDATION_SIGNALE",
      ];

      menuEntryStatus = editableStatus.includes(activeCandidacyStatus)
        ? "ACTIVE_WITH_EDIT_HINT"
        : "ACTIVE_WITHOUT_HINT";

      url = buildUrl({
        adminType: "Elm",
        suffix: candidacy.readyForJuryEstimatedAt
          ? "dossier-de-validation"
          : "ready-for-jury-estimated-date",
      });
    }
    return {
      label: "Dossier de validation",
      url,
      status: menuEntryStatus,
    };
  };

  const getPaymentRequestMenuEntry = (): CandidacyMenuEntry => {
    const activeFeasibility = candidacy.Feasibility.find((f) => f.isActive);

    const minimumStatusForPaymentRequest: CandidacyStatusStep =
      candidacy.financeModule !== "unireva" &&
      activeFeasibility?.decision !== "REJECTED"
        ? "DOSSIER_DE_VALIDATION_ENVOYE"
        : "DEMANDE_FINANCEMENT_ENVOYE";

    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";

    if (isStatusEqualOrAbove(minimumStatusForPaymentRequest)) {
      menuEntryStatus =
        activeCandidacyStatus === minimumStatusForPaymentRequest
          ? "ACTIVE_WITH_EDIT_HINT"
          : "ACTIVE_WITHOUT_HINT";
    }

    return {
      label: "Demande de paiement",
      url: buildUrl({ adminType: "Elm", suffix: "payment" }),
      status: menuEntryStatus,
    };
  };

  const getJuryMenuEntry = (): CandidacyMenuEntry | undefined => {
    const showJuryMenuEntry = candidacy.financeModule == "unifvae";
    const menuEntryStatus: CandidacyMenuEntryStatus = isStatusEqualOrAbove(
      "DEMANDE_FINANCEMENT_ENVOYE",
    )
      ? "ACTIVE_WITHOUT_HINT"
      : "INACTIVE";

    return showJuryMenuEntry
      ? {
          label: "Jury",
          url: buildUrl({ adminType: "Elm", suffix: "jury/date" }),
          status: menuEntryStatus,
        }
      : undefined;
  };

  return [
    getMeetingsMenuEntry(),
    getTrainingMenuEntry(),
    getTrainingValidationMenuEntry(),
    getAdmissibilityMenuEntry(),
    getFeasibilityMenuEntry(),
    getFundingRequestMenuEntry(),
    getDossierDeValidationMenuEntry(),
    getPaymentRequestMenuEntry(),
    getJuryMenuEntry(),
  ].filter((e) => e) as CandidacyMenuEntry[];
};
