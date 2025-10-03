import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { UpdateAppointmentInput } from "../appointment.types";

export const updateAppointment = async ({
  input,
  userInfo,
}: {
  input: UpdateAppointmentInput;
  userInfo: CandidacyAuditLogUserInfo;
}) => {
  const { appointmentId, ...rest } = input;

  const result = await prismaClient.appointment.update({
    where: { id: input.appointmentId },
    data: rest,
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
