import {
  CandidacyStatusStep,
  DossierDeValidationStatus,
  FeasibilityStatus,
  Prisma,
} from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { getWhereClauseFromSearchFilter } from "@/modules/shared/search/search";
import { prismaClient } from "@/prisma/client";

import { GetCandidaciesForCertificationAuthorityInput } from "../candidacy.types";
import { candidacySearchWord } from "../utils/candidacy.helper";
import { getWhereClauseFromStatusFilterForCertificationAuthority } from "../utils/getWhereClauseFromStatusFilterForCertificationAuthority.helper";

const CANDIDACY_STATUS_TO_INCLUDE: CandidacyStatusStep[] = [
  CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
  CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET,
  CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
  CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
  CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE,
  CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
  CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE,
];

const FEASIBILITY_DECISION_BY_STATUS: Partial<
  Record<CandidacyStatusStep, FeasibilityStatus>
> = {
  [CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE]: FeasibilityStatus.PENDING,
  [CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET]: FeasibilityStatus.COMPLETE,
  [CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET]:
    FeasibilityStatus.INCOMPLETE,
  [CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE]:
    FeasibilityStatus.ADMISSIBLE,
  [CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE]:
    FeasibilityStatus.REJECTED,
};

const VALIDATION_DECISION_BY_STATUS: Partial<
  Record<CandidacyStatusStep, DossierDeValidationStatus>
> = {
  [CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE]:
    DossierDeValidationStatus.PENDING,
  [CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE]:
    DossierDeValidationStatus.INCOMPLETE,
};

export const getCandidaciesForCertificationAuthority = async ({
  context,
  offset = 0,
  limit = 10000,
  statusFilter,
  searchFilter,
  sortByFilter,
  cohorteVaeCollectiveId,
  feasibilityStatuses,
  validationStatuses,
  juryStatuses,
  juryResults,
  includeDropouts = false,
}: GetCandidaciesForCertificationAuthorityInput & {
  context: GraphqlContext;
}) => {
  const isAdmin = context.auth.hasRole("admin");
  const { certificationAuthorityId, certificationAuthorityLocalAccountId } =
    await resolveCertificationAuthorityInfo(context);

  // Non-admin users must have a certification authority
  if (!isAdmin && !certificationAuthorityId) {
    return {
      rows: [],
      info: processPaginationInfo({
        totalRows: 0,
        limit,
        offset,
      }),
    };
  }

  const andClauses: Prisma.CandidacyEnhancedWhereInput[] = [
    { candidacy: { status: { in: CANDIDACY_STATUS_TO_INCLUDE } } },
  ];

  const feasibilityFilters = buildFeasibilityFilter(
    feasibilityStatuses,
    certificationAuthorityId,
  );
  if (feasibilityFilters) {
    andClauses.push({ feasibility: feasibilityFilters });
  }

  const validationFilter = buildValidationFilter(
    validationStatuses,
    certificationAuthorityId,
  );
  if (validationFilter) {
    andClauses.push({ dossierDeValidation: validationFilter });
  }

  // For local accounts, only include candidacies explicitly linked to them
  if (certificationAuthorityLocalAccountId) {
    andClauses.push({
      candidacy: {
        certificationAuthorityLocalAccountOnCandidacy: {
          some: {
            certificationAuthorityLocalAccountId,
          },
        },
      },
    });
  }

  // Status filter
  addClause(andClauses, {
    candidacy: {
      ...getWhereClauseFromStatusFilterForCertificationAuthority(
        statusFilter,
        includeDropouts,
      ),
    },
  });

  // Search filter
  addClause(andClauses, {
    candidacy: {
      ...getWhereClauseFromSearchFilter(candidacySearchWord, searchFilter),
    },
  });

  // Cohorte filter
  if (cohorteVaeCollectiveId) {
    andClauses.push({ candidacy: { cohorteVaeCollectiveId } });
  }

  // Dropout filter
  if (!includeDropouts && !statusFilter) {
    andClauses.push({ candidacy: { candidacyDropOut: null } });
  }

  // Jury status filter
  addClause(andClauses, buildJuryStatusClause(juryStatuses));

  // Jury result filter
  addClause(andClauses, buildJuryResultClause(juryResults));

  const whereClause: Prisma.CandidacyEnhancedWhereInput =
    andClauses.length === 1 ? andClauses[0] : { AND: andClauses };

  const totalRows = await prismaClient.candidacyEnhanced.count({
    where: whereClause,
  });

  const orderByClause = getOrderByClauseFromSortByFilter(sortByFilter);

  const candidacies = await prismaClient.candidacyEnhanced.findMany({
    where: whereClause,
    orderBy: orderByClause,
    skip: offset,
    take: limit,
    include: {
      candidacy: true,
    },
  });

  return {
    rows: candidacies.map(({ candidacy }) => candidacy),
    info: processPaginationInfo({
      totalRows,
      limit,
      offset,
    }),
  };
};

const getOrderByClauseFromSortByFilter = (
  sortByFilter: GetCandidaciesForCertificationAuthorityInput["sortByFilter"] = "DOSSIER_DE_FAISABILITE_ENVOYE_DESC",
):
  | Prisma.CandidacyEnhancedOrderByWithRelationInput
  | Prisma.CandidacyEnhancedOrderByWithRelationInput[]
  | undefined => {
  if (sortByFilter === "DATE_CREATION_DESC") {
    return [{ candidacy: { createdAt: "desc" } }];
  }
  if (sortByFilter === "DATE_CREATION_ASC") {
    return [{ candidacy: { createdAt: "asc" } }];
  }
  if (sortByFilter === "DATE_ENVOI_DESC") {
    return [{ candidacy: { sentAt: "desc" } }];
  }
  if (sortByFilter === "DATE_ENVOI_ASC") {
    return [{ candidacy: { sentAt: "asc" } }];
  }
  if (sortByFilter === "DOSSIER_DE_FAISABILITE_ENVOYE_DESC") {
    return [{ feasibility: { feasibilityFileSentAt: "desc" } }];
  }
  if (sortByFilter === "DOSSIER_DE_FAISABILITE_ENVOYE_ASC") {
    return [{ feasibility: { feasibilityFileSentAt: "asc" } }];
  }
  if (sortByFilter === "DOSSIER_DE_VALIDATION_ENVOYE_DESC") {
    return [{ dossierDeValidation: { dossierDeValidationSentAt: "desc" } }];
  }
  if (sortByFilter === "DOSSIER_DE_VALIDATION_ENVOYE_ASC") {
    return [{ dossierDeValidation: { dossierDeValidationSentAt: "asc" } }];
  }
  if (sortByFilter === "JURY_PROGRAMME_DESC") {
    return [{ jury: { dateOfSession: "desc" } }];
  }
  if (sortByFilter === "JURY_PROGRAMME_ASC") {
    return [{ jury: { dateOfSession: "asc" } }];
  }

  return undefined;
};

const resolveCertificationAuthorityInfo = async (
  context: GraphqlContext,
): Promise<{
  certificationAuthorityId: string | undefined;
  certificationAuthorityLocalAccountId: string | undefined;
}> => {
  if (
    !context.auth.hasRole("manage_feasibility") ||
    !context.auth.userInfo?.sub
  ) {
    return {
      certificationAuthorityId: undefined,
      certificationAuthorityLocalAccountId: undefined,
    };
  }

  try {
    const account = await prismaClient.account.findUnique({
      where: {
        keycloakId: context.auth.userInfo.sub,
      },
      select: {
        id: true,
        certificationAuthorityId: true,
        certificationAuthorityLocalAccount: {
          select: {
            id: true,
            certificationAuthorityId: true,
          },
        },
      },
    });

    if (!account) {
      return {
        certificationAuthorityId: undefined,
        certificationAuthorityLocalAccountId: undefined,
      };
    }

    // Certification Authority admin account
    if (account.certificationAuthorityId) {
      return {
        certificationAuthorityId: account.certificationAuthorityId,
        certificationAuthorityLocalAccountId: undefined,
      };
    }

    // Certification Authority local account
    if (
      account.certificationAuthorityLocalAccount?.[0]?.certificationAuthorityId
    ) {
      return {
        certificationAuthorityId:
          account.certificationAuthorityLocalAccount[0]
            .certificationAuthorityId,
        certificationAuthorityLocalAccountId:
          account.certificationAuthorityLocalAccount[0].id,
      };
    }

    return {
      certificationAuthorityId: undefined,
      certificationAuthorityLocalAccountId: undefined,
    };
  } catch (_error) {
    return {
      certificationAuthorityId: undefined,
      certificationAuthorityLocalAccountId: undefined,
    };
  }
};

const addClause = (
  clauses: Prisma.CandidacyEnhancedWhereInput[],
  clause?: Prisma.CandidacyEnhancedWhereInput,
) => {
  if (clause && Object.keys(clause).length > 0) {
    clauses.push(clause);
  }
};

const buildFeasibilityFilter = (
  statuses: CandidacyStatusStep[] | undefined,
  certificationAuthorityId?: string,
): Prisma.CandidacyEnhancedWhereInput["feasibility"] | undefined => {
  const filters: Prisma.CandidacyEnhancedWhereInput["feasibility"] = {};

  if (certificationAuthorityId) {
    filters.certificationAuthorityId = certificationAuthorityId;
  }

  const decisions = (statuses ?? [])
    .map((status) => FEASIBILITY_DECISION_BY_STATUS[status])
    .filter((decision): decision is FeasibilityStatus => Boolean(decision));

  if (decisions.length > 0) {
    filters.decision = { in: decisions };
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
};

const buildValidationFilter = (
  statuses: CandidacyStatusStep[] | undefined,
  certificationAuthorityId?: string,
): Prisma.CandidacyEnhancedWhereInput["dossierDeValidation"] | undefined => {
  if (!statuses || statuses.length === 0) {
    return undefined;
  }

  const filters: Prisma.CandidacyEnhancedWhereInput["dossierDeValidation"] = {};

  if (certificationAuthorityId) {
    filters.certificationAuthorityId = certificationAuthorityId;
  }

  const decisions = (statuses ?? [])
    .map((status) => VALIDATION_DECISION_BY_STATUS[status])
    .filter((decision): decision is DossierDeValidationStatus =>
      Boolean(decision),
    );

  if (decisions.length > 0) {
    filters.decision = { in: decisions };
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
};

const buildJuryStatusClause = (
  juryStatuses: GetCandidaciesForCertificationAuthorityInput["juryStatuses"],
): Prisma.CandidacyEnhancedWhereInput | undefined => {
  if (!juryStatuses || juryStatuses.length === 0) {
    return undefined;
  }

  const clauses: Prisma.CandidacyEnhancedWhereInput[] = [];

  juryStatuses.forEach((juryStatus) => {
    if (juryStatus === "TO_SCHEDULE") {
      clauses.push({
        candidacy: {
          status: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
        },
        jury: null,
      });
    } else if (juryStatus === "SCHEDULED") {
      clauses.push({
        jury: {
          dateOfSession: { gt: new Date() },
        },
      });
    }
  });

  return clauses.length > 0 ? { OR: clauses } : undefined;
};

const buildJuryResultClause = (
  juryResults: GetCandidaciesForCertificationAuthorityInput["juryResults"],
): Prisma.CandidacyEnhancedWhereInput | undefined => {
  if (!juryResults || juryResults.length === 0) {
    return undefined;
  }

  const hasAwaitingResult = (juryResults as string[]).includes(
    "AWAITING_RESULT",
  );
  const actualResults = juryResults.filter(
    (result) => (result as string) !== "AWAITING_RESULT",
  );

  const clauses: Prisma.CandidacyEnhancedWhereInput[] = [];

  if (actualResults.length > 0) {
    clauses.push({
      jury: {
        result: { in: actualResults },
      },
    });
  }

  if (hasAwaitingResult) {
    clauses.push({
      jury: {
        dateOfSession: { lte: new Date() },
        result: null,
      },
    });
  }

  return clauses.length > 0 ? { OR: clauses } : undefined;
};
