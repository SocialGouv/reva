import { prismaClient } from "@/prisma/client";

import { CreateAppointmentInput } from "../appointment.types";

export const createAppointment = async ({
  input,
}: {
  input: CreateAppointmentInput;
}) =>
  prismaClient.appointment.create({
    data: input,
  });
