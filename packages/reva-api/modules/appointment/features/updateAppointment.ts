import { prismaClient } from "@/prisma/client";

import { UpdateAppointmentInput } from "../appointment.types";

export const updateAppointment = async ({
  input,
}: {
  input: UpdateAppointmentInput;
}) => {
  const { appointmentId, ...rest } = input;
  return prismaClient.appointment.update({
    where: { id: input.appointmentId },
    data: rest,
  });
};
