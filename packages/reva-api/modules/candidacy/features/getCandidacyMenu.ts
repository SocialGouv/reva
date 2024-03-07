import { prismaClient } from "../../../prisma/client";
import { CandidacyMenuEntry } from "../candidacy.types";

export const getCandidacyMenu = ({
  candidacyId,
}: {
  candidacyId: string;
}): CandidacyMenuEntry[] => {
  const candidacy = prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
  });

  const buildUrl = urlBuilder({ candidacyId });

  return [
    {
      label: "Rendez-vous pédagogique",
      url: buildUrl({ adminType: "Elm", suffix: "meetings" }),
      status: "INACTIVE",
    },
    {
      label: "Définition du parcours",
      url: buildUrl({ adminType: "Elm", suffix: "training" }),
      status: "INACTIVE",
    },
    {
      label: "Validation du parcours",
      url: "#",
      status: "INACTIVE",
    },
    {
      label: "Dossier de faisabilité",
      url: buildUrl({ adminType: "Elm", suffix: "feasibility" }),
      status: "INACTIVE",
    },
    {
      label: "Demande de prise en charge",
      url: buildUrl({ adminType: "Elm", suffix: "funding" }),
      status: "INACTIVE",
    },
    {
      label: "Dossier de validation",
      url: buildUrl({ adminType: "Elm", suffix: "dossier-de-validation" }),
      status: "ACTIVE_WITHOUT_HINT",
    },
    {
      label: "Demande de paiement",
      url: buildUrl({ adminType: "Elm", suffix: "payment" }),
      status: "ACTIVE_WITH_EDIT_HINT",
    },
    {
      label: "Jury",
      url: buildUrl({ adminType: "Elm", suffix: "jury/date" }),
      status: "INACTIVE",
    },
    {
      label: "Journal des actions",
      url: buildUrl({ adminType: "React", suffix: "logs" }),
      status: "INACTIVE",
    },
  ];
};

const urlBuilder =
  ({ candidacyId }: { candidacyId: string }) =>
  ({ adminType, suffix }: { adminType: "Elm" | "React"; suffix: string }) =>
    `${process.env.BASE_URL || "https://vae.gouv.fr"}/${adminType === "Elm" ? "admin" : "admin2"}/candidacies/${candidacyId}/${suffix}`;
