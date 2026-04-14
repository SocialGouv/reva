import { prismaClient } from "@/prisma/client";

export const getAppointmentById = async ({
  candidacyId,
  appointmentId,
}: {
  candidacyId: string;
  appointmentId: string;
}) =>
  prismaClient.appointment.findUnique({
    where: { id: appointmentId, candidacyId },
  });
