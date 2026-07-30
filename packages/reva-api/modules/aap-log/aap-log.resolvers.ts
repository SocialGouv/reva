import { isAdmin, isAnyone } from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

import { AAPLog } from "./aap-log.types";
import { getAAPLogMessage } from "./features/getAAPLogMessage";
import { getAAPLogs } from "./features/getAAPLogs";

const unsafeResolvers = {
  MaisonMereAAP: {
    aapLogs: async ({ id: maisonMereAAPId }: { id: string }) =>
      getAAPLogs({ maisonMereAAPId }),
  },
  AAPLog: {
    message: (aapLog: AAPLog) => getAAPLogMessage({ aapLog }).message,
    details: (aapLog: AAPLog) => getAAPLogMessage({ aapLog }).details,
  },
};

export const aapLogResolvers = withPolicies(unsafeResolvers, {
  MaisonMereAAP: {
    aapLogs: isAdmin,
  },
  AAPLog: {
    // Formateurs sans argument sur lequel un contrôle d'appartenance pourrait porter ;
    // le parent `aapLogs` est déjà réservé à l'admin.
    message: isAnyone,
    details: isAnyone,
  },
});
