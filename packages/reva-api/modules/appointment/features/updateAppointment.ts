import { getCandidateAppUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
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
    where: { id: appointmentId },
  });

  if (!oldAppointment) {
    throw new Error("Rendez-vous non trouvé");
  }

  if (getAppointmentTemporalStatus({ date: oldAppointment.date }) === "PAST") {
    throw new Error("Impossible de modifier un rendez-vous passé");
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
