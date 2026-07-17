import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_RESOURCE_ACCESS } from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";

export const isAppointmentOfCandidacy =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const candidacyId =
      args.candidacyId ||
      args.input?.candidacyId ||
      root?.candidacyId ||
      root?.id;
    const appointmentId =
      args.appointmentId || args.input?.appointmentId || root?.appointmentId;

    if (!candidacyId || !appointmentId) {
      throw new Error(NOT_AUTHORIZED_RESOURCE_ACCESS);
    }

    const appointment = await prismaClient.appointment.findUnique({
      where: {
        id: appointmentId,
        candidacyId,
      },
      select: { id: true },
    });

    if (!appointment) {
      throw new Error(NOT_AUTHORIZED_RESOURCE_ACCESS);
    }

    return next(root, args, context, info);
  };
