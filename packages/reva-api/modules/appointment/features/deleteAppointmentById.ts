import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { getAppointmentTemporalStatus } from "./getAppointmentTemporalStatus";

export const deleteAppointmentById = async ({
  appointmentId,
  userInfo,
}: {
  candidacyId: string;
  appointmentId: string;
  userInfo: CandidacyAuditLogUserInfo;
}) => {
  const appointment = await prismaClient.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Rendez-vous non trouvé");
  }

  const appointmentTemporalStatus = getAppointmentTemporalStatus({
    date: appointment.date,
  });

  if (appointmentTemporalStatus === "PAST") {
    throw new Error("Impossible de supprimer un rendez-vous passé");
  }

  const result = await prismaClient.appointment.delete({
    where: { id: appointmentId },
  });

  await logCandidacyAuditEvent({
    candidacyId: appointment.candidacyId,
    eventType: "APPOINTMENT_DELETED",
    ...userInfo,
    details: {
      id: appointmentId,
      date: appointment.date,
      type: appointment.type,
    },
  });

  return result;
};
