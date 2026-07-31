import { AppointmentType } from "@prisma/client";

import {
  isAdminOrCandidacyCompanion,
  isAdminOrCanManageAppointment,
  isAnyone,
  isOwnerOrCanManageAppointment,
  isOwnerOrCanManageCandidacy,
} from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

import { buildAAPAuditLogUserInfoFromContext } from "../aap-log/features/logAAPAuditEvent";

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
      {
        candidacyId,
        appointmentId,
      }: { candidacyId: string; appointmentId: string },
    ) => getAppointmentById({ candidacyId, appointmentId }),
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

export const appointmentResolvers = withPolicies(unsafeResolvers, {
  // Calcul pur sur `root.date` : la feuille est protégée par son parent.
  Appointment: { temporalStatus: isAnyone },
  Candidacy: {
    appointments: isOwnerOrCanManageCandidacy,
    // Même donnée et même parent que `appointments` : mêmes ayants droit.
    firstAppointmentOccuredAt: isOwnerOrCanManageCandidacy,
  },
  Query: { appointment_getAppointmentById: isOwnerOrCanManageAppointment },
  Mutation: {
    appointment_createAppointment: isAdminOrCandidacyCompanion,
    appointment_updateAppointment: isAdminOrCanManageAppointment,
    appointment_deleteAppointment: isAdminOrCanManageAppointment,
  },
});
