import { hasRole } from "../shared/security/middlewares";
import {
  defaultSecurity,
  isAdmin,
  isAdminOrCertificationAuthority,
  isAdminOrCertificationAuthorityLocalAccountOwner,
  isAdminOrCertificationAuthorityOwner,
  isAdminOrCertificationRegistryManagerOfCertification,
  isAdminOrIsCertificationAuthorityStructureMember,
  isAdminOrIsCertificationAuthorityStructureRegistryManagerMember,
  isAdminOrManager,
  isAnyone,
} from "../shared/security/presets";

export const resolversSecurityMap = {
  "Mutation.*": defaultSecurity, // forbidden
  "Query.*": defaultSecurity, // forbidden

  "Query.certification_authority_getCertificationAuthority": isAdminOrManager,
  "Query.certification_authority_getCertificationAuthorities": isAdmin,
  "Query.certification_authority_getCertificationAuthorityStructures": isAdmin,
  "Query.certification_authority_getCertificationAuthorityStructure": isAdmin,
  "Query.certification_authority_searchCertificationAuthoritiesAndLocalAccounts":
    isAdmin,
  "Query.certification_authority_getCertificationAuthorityLocalAccount":
    isAdminOrCertificationAuthorityLocalAccountOwner,
  "Query.certification_authority_getCertificationAuthoritiesToTransferCandidacy":
    isAdminOrCertificationAuthority,
  "Query.certification_authority_getCertificationAuthorityLocalAccountsToTransferCandidacy":
    isAdminOrCertificationAuthority,

  "Mutation.certification_authority_updateCertificationAuthority": isAnyone, //security handled in resolver
  "Mutation.certification_authority_updateCertificationAuthorityDepartmentsAndCertifications":
    isAdmin,
  "Mutation.certification_authority_createCertificationAuthorityLocalAccount":
    isAnyone, //security handled in resolver
  "Mutation.certification_authority_updateCertificationAuthorityLocalAccount":
    isAnyone, //security handled in resolver
  "Mutation.certification_authority_deleteCertificationAuthorityLocalAccount":
    isAnyone, //security handled in resolver
  "Mutation.certification_authority_transferCandidacyToAnotherCertificationAuthority":
    isAdminOrCertificationAuthority,
  "Mutation.certification_authority_transferCandidacyToCertificationAuthorityLocalAccount":
    isAdminOrCertificationAuthority,
  "Mutation.certification_authority_createCertificationRegistryManager":
    isAdmin,
  "Mutation.certification_authority_updateCertificationAuthorityStructure":
    isAdmin,
  "Mutation.certification_authority_updateCertificationAuthorityStructureCertifications":
    isAdmin,
  "Mutation.certification_authority_updateCertificationAuthorityCertifications":
    isAdmin,
  "Mutation.certification_authority_createCertificationAuthority": isAdmin,
  "Mutation.certification_authority_updateCertificationAuthorityDepartments":
    isAdmin,
  "Mutation.certification_authority_acceptCgu": hasRole([
    "manage_certification_registry",
  ]),

  "CertificationAuthority.certificationAuthorityStructures":
    isAdminOrIsCertificationAuthorityStructureMember,
  "CertificationAuthority.account": isAdmin,

  "CertificationAuthorityLocalAccount.certificationAuthority":
    isAdminOrCertificationAuthorityOwner,
  "CertificationAuthorityLocalAccount.account": [
    hasRole([
      "admin",
      "manage_candidacy",
      "manage_feasibility",
      "manage_certification_authority_local_account",
    ]),
  ],

  "Certification.certificationAuthorityStructure": isAnyone,

  "CertificationAuthorityStructure.certificationAuthorities": isAdmin,
  "CertificationAuthorityStructure.certificationRegistryManager": isAdmin,
  "CertificationAuthorityStructure.certifications":
    isAdminOrCertificationRegistryManagerOfCertification,

  "CertificationRegistryManager.certificationAuthorityStructure":
    isAdminOrIsCertificationAuthorityStructureRegistryManagerMember,
};
