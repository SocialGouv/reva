import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { getCandidateAppUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { formatDateWithoutTimestamp } from "@/modules/shared/date/formatDateWithoutTimestamp";
import { formatUTCTime } from "@/modules/shared/date/formatUTCTime";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
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
    include: {
      candidacy: { include: { candidate: { include: { department: true } } } },
    },
  });

  const candidate = result.candidacy.candidate;

  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  const timeZone = candidate.department?.timezone || "Europe/Paris";

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

  await sendEmailUsingTemplate({
    to: { email: candidate.email },
    params: {
      candidateFullName: candidate.firstname + " " + candidate.lastname,
      appointmentDate: formatDateWithoutTimestamp(
        appointment.date,
        "dd/MM/yyyy",
        timeZone,
      ),
      appointmentTime: formatUTCTime(appointment.date, timeZone),
      appointmentUrl: `${getCandidateAppUrl()}/${appointment.candidacyId}/appointments/${appointment.id}`,
    },
    templateId: 634,
  });

  return result;
};
