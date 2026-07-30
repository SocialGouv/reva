import { isAdmin, isAnyone } from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

import { CandidacyLog } from "./candidacy-log.types";
import { getCandidacyLogMessage } from "./features/getCandidacyLogMessage";
import { getCandidacyLogs } from "./features/getCandidacyLogs";

const unsafeResolvers = {
  Candidacy: {
    candidacyLogs: async ({ id: candidacyId }: { id: string }) =>
      getCandidacyLogs({ candidacyId }),
  },
  CandidacyLog: {
    message: (candidacyLog: CandidacyLog) =>
      getCandidacyLogMessage({ candidacyLog }).message,
    details: (candidacyLog: CandidacyLog) =>
      getCandidacyLogMessage({ candidacyLog }).details,
  },
};

export const candidacyLogResolvers = withPolicies(unsafeResolvers, {
  Candidacy: {
    // Seule barrière sur le journal d'audit : la query parente `getCandidacyById` est
    // ouverte à l'AAP rattaché, au candidat propriétaire et au certificateur.
    candidacyLogs: isAdmin,
  },
  CandidacyLog: {
    // Formateurs sans argument sur lequel un contrôle d'appartenance pourrait porter ;
    // le parent `candidacyLogs` est déjà réservé à l'admin.
    message: isAnyone,
    details: isAnyone,
  },
});
