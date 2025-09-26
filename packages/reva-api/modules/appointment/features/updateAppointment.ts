import { prismaClient } from "@/prisma/client";

import { UpdateAppointmentInput } from "../appointment.types";

export const updateAppointment = async ({
  input,
}: {
  input: UpdateAppointmentInput;
}) =>
  prismaClient.appointment.update({
    where: { id: input.id },
    data: input,
  });
