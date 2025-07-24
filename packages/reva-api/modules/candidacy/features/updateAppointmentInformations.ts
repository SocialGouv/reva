import {
  isAfter,
  addMonths,
  isBefore,
  startOfToday,
  startOfDay,
} from "date-fns";

import { prismaClient } from "../../../prisma/client";

export const updateAppointmentInformations = async (params: {
  candidacyId: string;
  appointmentInformations: {
    firstAppointmentOccuredAt: Date;
  };
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: {
      id: params.candidacyId,
    },
    select: {
      createdAt: true,
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const today = startOfToday();

  if (
    isAfter(
      params.appointmentInformations.firstAppointmentOccuredAt,
      addMonths(today, 3),
    )
  ) {
    throw new Error(
      "La date de rendez-vous doit être dans les 3 prochains mois",
    );
  }

  if (
    isBefore(
      startOfDay(params.appointmentInformations.firstAppointmentOccuredAt),
      startOfDay(candidacy.createdAt),
    )
  ) {
    throw new Error(
      "La date de rendez-vous ne peut pas être inférieure à la date de création de la candidature",
    );
  }

  const updatedCandidacy = await prismaClient.candidacy.update({
    where: {
      id: params.candidacyId,
    },
    data: {
      firstAppointmentOccuredAt:
        params.appointmentInformations.firstAppointmentOccuredAt,
    },
  });

  return updatedCandidacy;
};
