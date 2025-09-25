import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { resolversSecurityMap } from "./appointment.security";
import { getAppointmentsByCandidacyId } from "./features/getAppointmentsByCandidacyId";

const unsafeResolvers = {
  Candidacy: {
    appointments: ({ id: candidacyId }: { id: string }) =>
      getAppointmentsByCandidacyId({ candidacyId }),
  },
};

export const appointmentResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
