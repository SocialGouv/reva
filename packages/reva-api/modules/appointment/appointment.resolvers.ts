import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { AppointmentType } from "@prisma/client";

import { buildAAPAuditLogUserInfoFromContext } from "../aap-log/features/logAAPAuditEvent";

import { resolversSecurityMap } from "./appointment.security";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "./appointment.types";
import { createAppointment } from "./features/createAppointment";
import { getAppointmentById } from "./features/getAppointmentById";
import { getAppointmentsByCandidacyId } from "./features/getAppointmentsByCandidacyId";
import { getFirstAppointmentOccuredAt } from "./features/getFirstAppointmentOccuredAt";
import { updateAppointment } from "./features/updateAppointment";

const unsafeResolvers = {
  Candidacy: {
    appointments: (
      { id: candidacyId }: { id: string },
      {
        type,
        onlyNext,
        offset,
        limit,
      }: {
        type: AppointmentType;
        onlyNext: boolean;
        offset: number;
        limit: number;
      },
    ) =>
      getAppointmentsByCandidacyId({
        candidacyId,
        type,
        onlyNext,
        offset,
        limit,
      }),
    firstAppointmentOccuredAt: ({ id: candidacyId }: { id: string }) =>
      getFirstAppointmentOccuredAt({ candidacyId }),
  },
  Query: {
    appointment_getAppointmentById: async (
      _: unknown,
      { appointmentId }: { appointmentId: string },
    ) => getAppointmentById({ appointmentId }),
  },
  Mutation: {
    appointment_createAppointment: async (
      _: unknown,
      { input }: { input: CreateAppointmentInput },
      context: GraphqlContext,
    ) =>
      createAppointment({
        input,
        userInfo: buildAAPAuditLogUserInfoFromContext(context),
      }),
    appointment_updateAppointment: async (
      _: unknown,
      { input }: { input: UpdateAppointmentInput },
      context: GraphqlContext,
    ) =>
      updateAppointment({
        input,
        userInfo: buildAAPAuditLogUserInfoFromContext(context),
      }),
  },
};

export const appointmentResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
