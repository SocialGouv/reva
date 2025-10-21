import { AppointmentType } from "@prisma/client";

import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { getCandidateAppUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { formatDateWithoutTimestamp } from "@/modules/shared/date/formatDateWithoutTimestamp";
import { formatUTCTime } from "@/modules/shared/date/formatUTCTime";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
import { prismaClient } from "@/prisma/client";

import { CreateAppointmentInput } from "../appointment.types";

import { getAppointmentTemporalStatus } from "./getAppointmentTemporalStatus";

export const createAppointment = async ({
  input,
  userInfo,
}: {
  input: CreateAppointmentInput;
  userInfo: CandidacyAuditLogUserInfo;
}) => {
  const appointmentsFeatureActive = await isFeatureActiveForUser({
    userKeycloakId: userInfo.userKeycloakId,
    feature: "APPOINTMENTS",
  });

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

  if (getAppointmentTemporalStatus({ date: data.date }) === "PAST") {
    throw new Error("Impossible de modifier un rendez-vous passé");
  }

  const candidate = await prismaClient.candidacy
    .findUnique({
      where: { id: data.candidacyId },
    })
    .candidate({
      include: {
        department: true,
      },
    });

  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  const result = await prismaClient.appointment.create({
    data,
  });

  if (appointmentsFeatureActive) {
    await logCandidacyAuditEvent({
      candidacyId: data.candidacyId,
      eventType: "APPOINTMENT_CREATED",
      ...userInfo,
      details: {
        id: result.id,
        date: data.date,
        type: data.type,
      },
    });
  } else {
    await logCandidacyAuditEvent({
      candidacyId: data.candidacyId,
      eventType: "APPOINTMENT_INFO_UPDATED",
      ...userInfo,
      details: {
        firstAppointmentOccuredAt: data.date,
      },
    });
  }

  if (sendEmailToCandidate) {
    const timeZone = candidate.department?.timezone || "Europe/Paris";

    await sendEmailUsingTemplate({
      to: { email: candidate.email },
      params: {
        candidateFullName: candidate.firstname + " " + candidate.lastname,
        appointmentDate: formatDateWithoutTimestamp(
          data.date,
          "dd/MM/yyyy",
          timeZone,
        ),
        appointmentTime: formatUTCTime(data.date, timeZone),
        appointmentUrl: `${getCandidateAppUrl()}/${result.candidacyId}/appointments/${result.id}`,
      },
      templateId: 632,
    });
  }

  return result;
};
