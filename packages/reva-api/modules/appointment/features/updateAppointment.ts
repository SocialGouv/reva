import { getCandidateAppUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
import {
  CANDIDAT_NON_TROUVE,
  RENDEZ_VOUS_NON_TROUVE,
} from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { UpdateAppointmentInput } from "../appointment.types";

import { getAppointmentTemporalStatus } from "./getAppointmentTemporalStatus";

export const updateAppointment = async ({
  input,
}: {
  input: UpdateAppointmentInput;
}) => {
  const { appointmentId, ...rest } = input;

  const oldAppointment = await prismaClient.appointment.findUnique({
    where: { id: appointmentId, candidacyId: input.candidacyId },
  });

  if (!oldAppointment) {
    throw new Error(RENDEZ_VOUS_NON_TROUVE);
  }

  if (getAppointmentTemporalStatus({ date: oldAppointment.date }) === "PAST") {
    throw new Error("Impossible de modifier un rendez-vous passé");
  }

  const updatedAppointment = await prismaClient.appointment.update({
    where: {
      id: input.appointmentId,
      candidacyId: input.candidacyId,
    },
    data: rest,
    include: {
      candidacy: { include: { candidate: true } },
    },
  });

  const candidate = updatedAppointment.candidacy.candidate;

  if (!candidate) {
    throw new Error(CANDIDAT_NON_TROUVE);
  }

  await sendEmailUsingTemplate({
    to: { email: candidate.email },
    params: {
      candidateFullName: candidate.firstname + " " + candidate.lastname,
      appointmentUrl: `${getCandidateAppUrl()}/${input.candidacyId}/appointments/${input.appointmentId}`,
    },
    templateId: 633,
  });

  return updatedAppointment;
};
