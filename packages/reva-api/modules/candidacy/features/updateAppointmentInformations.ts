import { prismaClient } from "../../../prisma/client";
import {
  isAfter,
  addMonths,
  isBefore,
  startOfToday,
  startOfDay,
} from "date-fns";

export const candidacyIncludes = {
  experiences: true,
  candidacyStatuses: true,
  department: true,
  certificationsAndRegions: {
    select: {
      certification: true,
      region: true,
    },
    where: {
      isActive: true,
    },
  },
  organism: true,
  basicSkills: {
    select: {
      basicSkill: true,
    },
  },
  trainings: {
    select: {
      training: true,
    },
  },
  candidacyDropOut: {
    include: {
      dropOutReason: true,
    },
  },
  reorientationReason: true,
  ccn: true,
};

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
    include: {
      ...candidacyIncludes,
      candidate: true,
    },
  });

  const candidaciesOnRegionsAndCertifications =
    await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
      where: {
        candidacyId: params.candidacyId,
        isActive: true,
      },
      select: {
        certification: true,
        region: true,
      },
    });

  return {
    id: updatedCandidacy.id,
    regionId: candidaciesOnRegionsAndCertifications?.region.id,
    region: candidaciesOnRegionsAndCertifications?.region,
    department: updatedCandidacy.department,
    certificationId: candidaciesOnRegionsAndCertifications?.certification.id,
    certification: candidaciesOnRegionsAndCertifications?.certification,
    organismId: updatedCandidacy.organismId,
    experiences: updatedCandidacy.experiences,
    phone: updatedCandidacy.candidate?.phone || null,
    email: updatedCandidacy.candidate?.email || updatedCandidacy.email,
    typology: updatedCandidacy.typology,
    typologyAdditional: updatedCandidacy.typologyAdditional,
    firstAppointmentOccuredAt: updatedCandidacy.firstAppointmentOccuredAt,
    appointmentCount: updatedCandidacy.appointmentCount,
    candidacyDropOut: updatedCandidacy.candidacyDropOut,
    candidacyStatuses: updatedCandidacy.candidacyStatuses,
    createdAt: updatedCandidacy.createdAt,
  };
};
