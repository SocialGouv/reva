import { AppointmentType } from "@prisma/client";

import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { CreateAppointmentInput } from "../appointment.types";

export const createAppointment = async ({
  input,
  userInfo,
}: {
  input: CreateAppointmentInput;
  userInfo: CandidacyAuditLogUserInfo;
}) => {
  const existingRendezVousPédagogique =
    await prismaClient.appointment.findFirst({
      where: {
        candidacyId: input.candidacyId,
        type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      },
    });

  if (existingRendezVousPédagogique) {
    throw new Error(
      "Il y a déjà un rendez-vous pédagogique pour cette candidature",
    );
  }

  const result = await prismaClient.appointment.create({
    data: input,
  });

  //TODO: update logging event when we will have more than one appointment
  await logCandidacyAuditEvent({
    candidacyId: input.candidacyId,
    eventType: "APPOINTMENT_INFO_UPDATED",
    ...userInfo,
    details: {
      firstAppointmentOccuredAt: input.date,
    },
  });

  return result;
};
