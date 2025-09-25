import { AppointmentType, Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { createCandidacyHelper } from "./create-candidacy-helper";

export const createAppointmentHelper = async (
  args?: Partial<Prisma.AppointmentUncheckedCreateInput>,
) => {
  let candidacyId = args?.candidacyId;
  if (!candidacyId) {
    const candidacy = await createCandidacyHelper();
    candidacyId = candidacy.id;
  }

  return prismaClient.appointment.create({
    data: {
      candidacyId,
      title: "Test Appointment",
      description: "Test Description",
      type: AppointmentType.RENDEZ_VOUS_PEDAGOGIQUE,
      date: new Date(),
      ...args,
    },
  });
};
