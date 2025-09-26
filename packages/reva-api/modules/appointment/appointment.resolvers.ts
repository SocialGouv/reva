import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { resolversSecurityMap } from "./appointment.security";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "./appointment.types";
import { createAppointment } from "./features/createAppointment";
import { getAppointmentsByCandidacyId } from "./features/getAppointmentsByCandidacyId";
import { updateAppointment } from "./features/updateAppointment";

const unsafeResolvers = {
  Candidacy: {
    appointments: ({ id: candidacyId }: { id: string }) =>
      getAppointmentsByCandidacyId({ candidacyId }),
  },
  Mutation: {
    appointment_createAppointment: async (
      _: unknown,
      { input }: { input: CreateAppointmentInput },
    ) => createAppointment({ input }),
    appointment_updateAppointment: async (
      _: unknown,
      { input }: { input: UpdateAppointmentInput },
    ) => updateAppointment({ input }),
  },
};

export const appointmentResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
