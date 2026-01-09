import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { AppointmentType } from "@prisma/client";

import { buildAAPAuditLogUserInfoFromContext } from "../aap-log/features/logAAPAuditEvent";

import { resolversSecurityMap } from "./appointment.security";
import {
  AppointmentSortBy,
  AppointmentTemporalStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "./appointment.types";
import { createAppointment } from "./features/createAppointment";
import { deleteAppointmentById } from "./features/deleteAppointmentById";
import { getAppointmentById } from "./features/getAppointmentById";
import { getAppointmentsByCandidacyId } from "./features/getAppointmentsByCandidacyId";
import { getAppointmentTemporalStatus } from "./features/getAppointmentTemporalStatus";
import { getFirstAppointmentOccuredAt } from "./features/getFirstAppointmentOccuredAt";
import { updateAppointment } from "./features/updateAppointment";

const unsafeResolvers = {
  Appointment: {
    temporalStatus: ({ date }: { date: Date }) =>
      getAppointmentTemporalStatus({ date }),
  },
  Candidacy: {
    appointments: (
      { id: candidacyId }: { id: string },
      {
        type,
        temporalStatusFilter,
        sortBy,
        offset,
        limit,
      }: {
        type?: AppointmentType;
        temporalStatusFilter?: AppointmentTemporalStatus;
        sortBy?: AppointmentSortBy;
        offset: number;
        limit: number;
      },
    ) =>
      getAppointmentsByCandidacyId({
        candidacyId,
        type,
        temporalStatusFilter,
        sortBy,
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
    ) =>
      updateAppointment({
        input,
      }),
    appointment_deleteAppointment: async (
      _: unknown,
      {
        candidacyId,
        appointmentId,
      }: { candidacyId: string; appointmentId: string },
      context: GraphqlContext,
    ) =>
      deleteAppointmentById({
        candidacyId,
        appointmentId,
        userInfo: buildAAPAuditLogUserInfoFromContext(context),
      }),
  },
};

export const appointmentResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
