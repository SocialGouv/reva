import { prismaClient } from "@/prisma/client";

export const getAppointmentById = async ({
  appointmentId,
}: {
  appointmentId: string;
}) =>
  prismaClient.appointment.findUnique({
    where: { id: appointmentId },
  });
