import { hasRole } from "@/modules/shared/security/middlewares";
import {
  defaultSecurity,
  isAdminOrCertificationRegistryManagerOfCertification,
  isAnyone,
} from "@/modules/shared/security/presets";

export const referentialResolversSecurityMap = {
  "Mutation.*": defaultSecurity,

  "Query.searchCertificationsForAdmin": [hasRole(["admin"])],
  "Query.searchCertificationsV2ForRegistryManager": [
    hasRole(["admin", "manage_certification_registry"]),
  ],
  "Mutation.referential_updateCompetenceBlocsByCertificationId": [
    hasRole(["admin"]),
  ],
  "Mutation.referential_addCertification": [hasRole(["admin"])],
  "Mutation.referential_replaceCertification":
    isAdminOrCertificationRegistryManagerOfCertification,
  "Mutation.referential_createCertificationCompetenceBloc": hasRole(["admin"]),
  "Mutation.referential_updateCertificationCompetenceBloc":
    isAdminOrCertificationRegistryManagerOfCertification,
  "Mutation.referential_deleteCertificationCompetenceBloc": [
    hasRole(["admin"]),
  ],
  "Mutation.referential_updateCertificationStructureAndCertificationAuthorities":
    [hasRole(["admin"])],
  "Mutation.referential_sendCertificationToRegistryManager": [
    hasRole(["admin"]),
  ],
  "Mutation.referential_resetCompetenceBlocsByCertificationId": [
    hasRole(["admin"]),
  ],

  "Mutation.referential_updateCertificationPrerequisites":
    isAdminOrCertificationRegistryManagerOfCertification,

  "Mutation.referential_updateCertificationDescription":
    isAdminOrCertificationRegistryManagerOfCertification,

  "Mutation.referential_validateCertification":
    isAdminOrCertificationRegistryManagerOfCertification,

  "Mutation.referential_updateCertificationAdditionalInfo":
    isAdminOrCertificationRegistryManagerOfCertification,

  "Query.getEtablissementAsAdmin": [hasRole(["admin"])],
  "Query.getCertificationCompetenceBloc": isAnyone,
};
