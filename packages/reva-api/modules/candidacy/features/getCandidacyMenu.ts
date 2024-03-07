import { CandidacyStatusStep } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import {
  CandidacyMenuEntry,
  CandidacyMenuEntryStatus,
} from "../candidacy.types";

export const getCandidacyMenu = async ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<CandidacyMenuEntry[]> => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: {
      candidacyStatuses: { where: { isActive: true } },
      Feasibility: true,
      organism: true,
    },
  });

  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée.");
  }

  const activeCandidacyStatus = candidacy.candidacyStatuses[0].status;

  const isStatusEqualOrAbove = buildIsStatusEqualOrAbove(activeCandidacyStatus);

  const buildUrl = urlBuilder({ candidacyId });

  const getMeetingsMenuEntry = (): CandidacyMenuEntry => ({
    label: "Rendez-vous pédagogique",
    url: buildUrl({ adminType: "Elm", suffix: "meetings" }),
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
          activeFeasibility === null) ||
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

    {
      label: "Journal des actions",
      url: buildUrl({ adminType: "React", suffix: "logs" }),
      status: "INACTIVE",
    },
  ].filter((e) => e) as CandidacyMenuEntry[];
};

const urlBuilder =
  ({ candidacyId }: { candidacyId: string }) =>
  ({ adminType, suffix }: { adminType: "Elm" | "React"; suffix: string }) =>
    `${process.env.BASE_URL || "https://vae.gouv.fr"}/${adminType === "Elm" ? "admin" : "admin2"}/candidacies/${candidacyId}/${suffix}`;

const buildIsStatusEqualOrAbove =
  (currentStatus: CandidacyStatusStep) => (status: CandidacyStatusStep) => {
    return (
      statusToProgressPosition(currentStatus) >=
      statusToProgressPosition(status)
    );
  };

const statusToProgressPosition = (status: CandidacyStatusStep) => {
  switch (status) {
    case "ARCHIVE":
      return -1;
    case "PROJET":
      return 0;
    case "VALIDATION":
      return 1;
    case "PRISE_EN_CHARGE":
      return 1;
    case "PARCOURS_ENVOYE":
      return 3;
    case "PARCOURS_CONFIRME":
      return 5;
    case "DOSSIER_FAISABILITE_INCOMPLET":
      return 5;
    case "DOSSIER_FAISABILITE_ENVOYE":
      return 6;
    case "DOSSIER_FAISABILITE_RECEVABLE":
      return 7;
    case "DOSSIER_FAISABILITE_NON_RECEVABLE":
      return 7;
    case "DEMANDE_FINANCEMENT_ENVOYE":
      return 8;
    case "DOSSIER_DE_VALIDATION_SIGNALE":
      return 9;
    case "DOSSIER_DE_VALIDATION_ENVOYE":
      return 10;
    case "DEMANDE_PAIEMENT_ENVOYEE":
      return 11;
    default:
      return -1;
  }
};
