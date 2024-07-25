import { CandidacyStatusStep } from "@prisma/client";

import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";
import {
  CandidacyMenuEntry,
  CandidacyMenuEntryStatus,
} from "../candidacy-menu.types";
import { CandidacyForMenu } from "./getCandidacyForMenu";
import { menuUrlBuilder } from "./getMenuUrlBuilder";
import { isCandidacyStatusEqualOrAboveGivenStatus } from "./isCandidacyStatusEqualOrAboveGivenStatus";

export const getActiveCandidacyMenu = async ({
  candidacy,
  userKeycloakId,
}: {
  candidacy: CandidacyForMenu;
  userKeycloakId?: string;
}) => {
  const activeCandidacyStatus = candidacy.candidacyStatuses.find(
    (status) => status.isActive,
  )?.status as CandidacyStatusStep;

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
        adminType: "React",
        suffix: "training",
      });
    } else if (candidacy.firstAppointmentOccuredAt) {
      trainingUrl = buildUrl({
        adminType: "React",
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
    userKeycloakId,
    feasibilityFormat,
  }: {
    userKeycloakId?: string;
    feasibilityFormat: "UPLOADED_PDF" | "DEMATERIALIZED";
  }): Promise<CandidacyMenuEntry | undefined> => {
    const activeFeasibility = candidacy.Feasibility.find((f) => f.isActive);

    const showFeasibilityEntry =
      candidacy.organism?.typology !== "experimentation";

    const isDematerializedFeasibilityFeatureActive =
      await isFeatureActiveForUser({
        userKeycloakId,
        feature: "DEMATERIALIZED_FEASIBILITY",
      });

    let menuEntryStatus: CandidacyMenuEntryStatus = "INACTIVE";
    const editableStatus: CandidacyStatusStep[] = [
      "PARCOURS_CONFIRME",
      "DOSSIER_FAISABILITE_INCOMPLET",
    ];
    if (
      (editableStatus.includes(activeCandidacyStatus) && !activeFeasibility) ||
      activeFeasibility?.decision === "INCOMPLETE"
    ) {
      menuEntryStatus = "ACTIVE_WITH_EDIT_HINT";
    } else if (isStatusEqualOrAbove("PARCOURS_CONFIRME")) {
      menuEntryStatus = "ACTIVE_WITHOUT_HINT";
    } else {
      menuEntryStatus = "INACTIVE";
    }

    let url = "#";

    if (isStatusEqualOrAbove("PARCOURS_CONFIRME")) {
      url =
        isDematerializedFeasibilityFeatureActive &&
        feasibilityFormat === "DEMATERIALIZED"
          ? buildUrl({ adminType: "React", suffix: "feasibility-aap" })
          : buildUrl({ adminType: "React", suffix: "feasibility-aap/pdf" });
    }

    return showFeasibilityEntry
      ? {
          label: "Dossier de faisabilité",
          url,
          status: menuEntryStatus,
        }
      : undefined;
  };

  const getFundingRequestMenuEntry = (): CandidacyMenuEntry | undefined => {
    //pas de page de demande de financemnt si le financement de la candidature est "hors plateforme"
    if (candidacy.financeModule === "hors_plateforme") {
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
        adminType: "React",
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

      menuEntryStatus = editableStatus.includes(activeCandidacyStatus)
        ? "ACTIVE_WITH_EDIT_HINT"
        : "ACTIVE_WITHOUT_HINT";

      url = buildUrl({
        adminType: "React",
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

    if (isStatusEqualOrAbove(minimumStatusForPaymentRequest)) {
      menuEntryStatus =
        activeCandidacyStatus === minimumStatusForPaymentRequest
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
          url: buildUrl({ adminType: "React", suffix: "jury-aap" }),
          status: menuEntryStatus,
        }
      : {
          label: "Jury",
          url: buildUrl({ adminType: "React", suffix: "exam-info" }),
          status: menuEntryStatus,
        };
  };

  return [
    getMeetingsMenuEntry(),
    getTrainingMenuEntry(),
    getTrainingValidationMenuEntry(),
    await getFeasibilityMenuEntry({
      userKeycloakId,
      feasibilityFormat: candidacy.feasibilityFormat,
    }),
    getFundingRequestMenuEntry(),
    getDossierDeValidationMenuEntry(),
    await getPaymentRequestMenuEntry(),
    getJuryMenuEntry(),
  ].filter((e) => e) as CandidacyMenuEntry[];
};
