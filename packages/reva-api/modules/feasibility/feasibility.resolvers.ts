import {
  isAdmin,
  isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  isAdminOrCertificationAuthority,
  isAdminOrOwnerOfCandidacy,
} from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

import { getCandidacy } from "../candidacy/features/getCandidacy";

import {
  getActiveFeasibilities,
  getActiveFeasibilityByCandidacyid,
  getActiveFeasibilityCountByCategory,
  getCertificationAuthorities,
  getFeasibilityById,
  getFileNameAndUrl,
} from "./feasibility.features";
import { FeasibilityCategoryFilter } from "./feasibility.types";
import { getFeasibilityHistory } from "./features/getFeasibilityHistory";
import { getWarningOnFeasibilitySubmissionForCandidacyId } from "./features/getWarningOnFeasibealitySubmissionForCandidacyId";
import { revokeCertificationAuthorityDecision } from "./features/revokeCertificationAuthorityDecision";
import { updateFeasibilityFileDematAutonomeFirstOpeningAt } from "./features/updateFeasibilityFileDematAutonomeFirstOpeningAt";
import { updateFeasibilityFileTemplateFirstReadAt } from "./features/updateFeasibilityFileTemplateFirstReadAt";

const unsafeResolvers = {
  Candidacy: {
    certificationAuthorities: ({ id: candidacyId }: { id: string }) =>
      getCertificationAuthorities({ candidacyId }),
    feasibility: ({ id: candidacyId }: { id: string }) =>
      getActiveFeasibilityByCandidacyid({ candidacyId }),
    warningOnFeasibilitySubmission: ({ id: candidacyId }: { id: string }) =>
      getWarningOnFeasibilitySubmissionForCandidacyId(candidacyId),
  },
  Feasibility: {
    decisionFile: ({
      candidacyId,
      decisionFileId,
    }: {
      candidacyId: string;
      decisionFileId: string;
    }) => getFileNameAndUrl({ candidacyId, fileId: decisionFileId }),
    history: ({ candidacyId, id }: { candidacyId: string; id: string }) =>
      getFeasibilityHistory({ candidacyId, feasibilityId: id }),
    candidacy: ({ candidacyId }: { candidacyId: string }) =>
      getCandidacy({ candidacyId }),
  },
  Query: {
    feasibilityCountByCategory: (
      _: unknown,
      args: {
        searchFilter?: string;
        certificationAuthorityId?: string;
        certificationAuthorityLocalAccountId?: string;
      },
      context: any,
    ) =>
      getActiveFeasibilityCountByCategory({
        keycloakId: context.auth.userInfo?.sub,
        hasRole: context.auth.hasRole,
        ...args,
      }),
    feasibilities: (
      _: unknown,
      args: {
        offset?: number;
        limit?: number;
        category?: FeasibilityCategoryFilter;
        searchFilter?: string;
        certificationAuthorityId?: string;
        certificationAuthorityLocalAccountId?: string;
        cohorteVaeCollectiveId?: string;
      },
      context: any,
    ) =>
      getActiveFeasibilities({
        keycloakId: context.auth.userInfo?.sub,
        hasRole: context.auth.hasRole,
        ...args,
      }),
    feasibility: (_: unknown, args: { feasibilityId: string }, context: any) =>
      getFeasibilityById({
        feasibilityId: args.feasibilityId,
        hasRole: context.auth.hasRole,
        keycloakId: context.auth?.userInfo?.sub,
      }),
    feasibility_getActiveFeasibilityByCandidacyId: (
      _parent: unknown,
      { candidacyId }: { candidacyId: string },
    ) => getActiveFeasibilityByCandidacyid({ candidacyId }),
  },
  Mutation: {
    feasibility_updateFeasibilityFileTemplateFirstReadAt: (
      _parent: unknown,
      { candidacyId }: { candidacyId: string },
      context: GraphqlContext,
    ) => updateFeasibilityFileTemplateFirstReadAt({ candidacyId, context }),
    feasibility_updateFeasibilityFileDematAutonomeFirstOpeningAt: (
      _parent: unknown,
      { candidacyId }: { candidacyId: string },
      context: GraphqlContext,
    ) =>
      updateFeasibilityFileDematAutonomeFirstOpeningAt({
        candidacyId,
        context,
      }),
    feasibility_revokeCertificationAuthorityDecision: (
      _parent: unknown,
      { feasibilityId, reason }: { feasibilityId: string; reason?: string },
      context: GraphqlContext,
    ) =>
      revokeCertificationAuthorityDecision({ feasibilityId, reason, context }),
  },
};

export const feasibilityResolvers = withPolicies(unsafeResolvers, {
  // Ces racines portent bien un identifiant de candidature (`root.id` pour une `Candidacy`,
  // `root.candidacyId` pour une `Feasibility`) : le contrôle d'ownership y est applicable, à la
  // différence des enfants du DFF et du PDF.
  Candidacy: {
    certificationAuthorities:
      isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
    feasibility: isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
    // Pas du référentiel : l'avertissement est dérivé des AUTRES candidatures du candidat et
    // révèle qu'il a déposé plusieurs dossiers cette année ou qu'un dossier a été rejeté.
    warningOnFeasibilitySubmission:
      isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  },
  Feasibility: {
    // URL signée vers le courrier de décision.
    decisionFile: isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
    history: isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
    candidacy: isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  },
  // Ces trois requêtes ne sont pas rattachées à une candidature : le rôle est la seule garde
  // possible en amont. Elle reprend exactement le contrôle que les features faisaient déjà en
  // interne, désormais visible et testable.
  //
  // Le périmètre par dossier reste tenu par `canManageFeasibility` dans `getFeasibilityById`,
  // mais celui-ci lève `DOSSIER_INTROUVABLE` avant de le faire : un certificateur distingue donc
  // encore un id de dossier existant d'un id inventé. Refermer cet oracle demande de réordonner
  // la feature.
  Query: {
    feasibilityCountByCategory: isAdminOrCertificationAuthority,
    feasibilities: isAdminOrCertificationAuthority,
    feasibility: isAdminOrCertificationAuthority,
    feasibility_getActiveFeasibilityByCandidacyId:
      isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  },
  Mutation: {
    feasibility_updateFeasibilityFileTemplateFirstReadAt:
      isAdminOrOwnerOfCandidacy,
    feasibility_updateFeasibilityFileDematAutonomeFirstOpeningAt:
      isAdminOrOwnerOfCandidacy,
    feasibility_revokeCertificationAuthorityDecision: isAdmin,
  },
});
