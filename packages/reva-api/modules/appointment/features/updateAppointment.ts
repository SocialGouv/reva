import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { getCandidateAppUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
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

  const updatedAppointment = await prismaClient.appointment.update({
    where: { id: input.appointmentId },
    data: rest,
    include: {
      candidacy: { include: { candidate: true } },
    },
  });

  const candidate = updatedAppointment.candidacy.candidate;

  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  if (appointmentsFeatureActive) {
    await sendEmailUsingTemplate({
      to: { email: candidate.email },
      params: {
        candidateFullName: candidate.firstname + " " + candidate.lastname,
        appointmentUrl: `${getCandidateAppUrl()}/${input.candidacyId}/appointments/${input.appointmentId}`,
      },
      templateId: 633,
    });
  } else {
    await logCandidacyAuditEvent({
      candidacyId: input.candidacyId,
      eventType: "APPOINTMENT_INFO_UPDATED",
      ...userInfo,
      details: {
        firstAppointmentOccuredAt: input.date,
      },
    });
  }

  return updatedAppointment;
};
