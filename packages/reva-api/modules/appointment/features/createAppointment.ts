import { AppointmentType } from "@prisma/client";

import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { formatDateWithoutTimestamp } from "@/modules/shared/date/formatDateWithoutTimestamp";
import { formatUTCTimeWithoutTimezoneConversion } from "@/modules/shared/date/formatUTCTimeWithoutTimezoneConversion";
import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
import { prismaClient } from "@/prisma/client";

import { CreateAppointmentInput } from "../appointment.types";

export const createAppointment = async ({
  input,
  userInfo,
}: {
  input: CreateAppointmentInput;
  userInfo: CandidacyAuditLogUserInfo;
}) => {
  const { sendEmailToCandidate, ...data } = input;
  const existingRendezVousPédagogique =
    await prismaClient.appointment.findFirst({
      where: {
        candidacyId: data.candidacyId,
        type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      },
    });

  if (
    data.type === AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE &&
    existingRendezVousPédagogique
  ) {
    throw new Error(
      "Il y a déjà un rendez-vous pédagogique pour cette candidature",
    );
  }

  const candidate = await prismaClient.candidacy
    .findUnique({
      where: { id: data.candidacyId },
    })
    .candidate();

  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  const result = await prismaClient.appointment.create({
    data,
  });

  //TODO: update logging event when we will have more than one appointment
  await logCandidacyAuditEvent({
    candidacyId: data.candidacyId,
    eventType: "APPOINTMENT_INFO_UPDATED",
    ...userInfo,
    details: {
      firstAppointmentOccuredAt: data.date,
    },
  });

  if (sendEmailToCandidate) {
    await sendEmailUsingTemplate({
      to: { email: candidate.email },
      params: {
        candidateFullName: candidate.firstname + " " + candidate.lastname,
        appointmentDate: formatDateWithoutTimestamp(data.date),
        appointmentTime: data.time
          ? formatUTCTimeWithoutTimezoneConversion(data.time)
          : undefined,
        appointmentUrl: getBackofficeUrl({
          path: `/candidacies/${data.candidacyId}/appointments/${result.id}`,
        }),
      },
      templateId: 632,
    });
  }

  return result;
};
