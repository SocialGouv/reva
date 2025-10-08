import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { prismaClient } from "@/prisma/client";

import { UpdateAppointmentInput } from "../appointment.types";

import { getAppointmentTemporalStatus } from "./getAppointmentTemporalStatus";

export const updateAppointment = async ({
  input,
  userInfo,
}: {
  input: UpdateAppointmentInput;
  userInfo: CandidacyAuditLogUserInfo;
}) => {
  const appointmentsFeatureActive = await isFeatureActiveForUser({
    userKeycloakId: userInfo.userKeycloakId,
    feature: "APPOINTMENTS",
  });

  const { appointmentId, ...rest } = input;

  if (appointmentsFeatureActive) {
    const oldAppointment = await prismaClient.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!oldAppointment) {
      throw new Error("Rendez-vous non trouvé");
    }

    if (
      getAppointmentTemporalStatus({ date: oldAppointment.date }) === "PAST"
    ) {
      throw new Error("Impossible de modifier un rendez-vous passé");
    }
  }

  const result = await prismaClient.appointment.update({
    where: { id: input.appointmentId },
    data: rest,
  });

  if (!appointmentsFeatureActive) {
    //TODO: update logging event when we will have more than one appointment
    await logCandidacyAuditEvent({
      candidacyId: input.candidacyId,
      eventType: "APPOINTMENT_INFO_UPDATED",
      ...userInfo,
      details: {
        firstAppointmentOccuredAt: input.date,
      },
    });
  }

  return result;
};
