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
