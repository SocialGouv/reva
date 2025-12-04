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

  const andClauses: Prisma.CandidacyWhereInput[] = [
    { status: { in: CANDIDACY_STATUS_TO_INCLUDE } },
  ];

  const feasibilityFilter = buildFeasibilityFilter(
    feasibilityStatuses,
    certificationAuthorityId,
    certificationAuthorityLocalAccountId,
  );
  if (feasibilityFilter) {
    andClauses.push({ Feasibility: feasibilityFilter });
  }

  const validationFilter = buildValidationFilter(
    validationStatuses,
    certificationAuthorityId,
    certificationAuthorityLocalAccountId,
  );
  if (validationFilter) {
    andClauses.push({ dossierDeValidation: validationFilter });
  }

  // For local accounts, only include candidacies explicitly linked to them
  if (certificationAuthorityLocalAccountId) {
    andClauses.push({
      certificationAuthorityLocalAccountOnCandidacy: {
        some: {
          certificationAuthorityLocalAccountId,
        },
      },
    });
  }

  addClause(
    andClauses,
    getWhereClauseFromStatusFilterForCertificationAuthority(
      statusFilter,
      includeDropouts,
    ),
  );

  addClause(
    andClauses,
    getWhereClauseFromSearchFilter(candidacySearchWord, searchFilter),
  );

  if (cohorteVaeCollectiveId) {
    andClauses.push({ cohorteVaeCollectiveId });
  }

  if (!includeDropouts && !statusFilter) {
    andClauses.push({ candidacyDropOut: null });
  }

  addClause(andClauses, buildJuryStatusClause(juryStatuses));
  addClause(andClauses, buildJuryResultClause(juryResults));

  const whereClause: Prisma.CandidacyWhereInput =
    andClauses.length === 1 ? andClauses[0] : { AND: andClauses };

  const totalRows = await prismaClient.candidacy.count({
    where: whereClause,
  });

  const candidacies = await prismaClient.candidacy.findMany({
    where: whereClause,
    orderBy: getOrderByClauseFromSortByFilter(sortByFilter),
    skip: offset,
    take: limit,
  });

  return {
    rows: candidacies,
    info: processPaginationInfo({
      totalRows,
      limit,
      offset,
    }),
  };
};

const getOrderByClauseFromSortByFilter = (
  sortByFilter: GetCandidaciesForCertificationAuthorityInput["sortByFilter"] = "DATE_CREATION_DESC",
):
  | Prisma.CandidacyOrderByWithRelationInput
  | Prisma.CandidacyOrderByWithRelationInput[]
  | undefined => {
  if (sortByFilter === "DATE_CREATION_DESC") {
    return [{ createdAt: "desc" }];
  }
  if (sortByFilter === "DATE_CREATION_ASC") {
    return [{ createdAt: "asc" }];
  }
  if (sortByFilter === "DATE_ENVOI_DESC") {
    return [{ sentAt: "desc" }];
  }
  if (sortByFilter === "DATE_ENVOI_ASC") {
    return [{ sentAt: "asc" }];
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
  clauses: Prisma.CandidacyWhereInput[],
  clause?: Prisma.CandidacyWhereInput,
) => {
  if (clause && Object.keys(clause).length > 0) {
    clauses.push(clause);
  }
};

const buildFeasibilityFilter = (
  statuses: CandidacyStatusStep[] | undefined,
  certificationAuthorityId?: string,
  certificationAuthorityLocalAccountId?: string,
): Prisma.CandidacyWhereInput["Feasibility"] | undefined => {
  const baseFilter: Prisma.FeasibilityWhereInput = certificationAuthorityId
    ? { certificationAuthorityId }
    : {};

  // For local accounts, also filter by the candidacy link
  if (certificationAuthorityLocalAccountId) {
    baseFilter.candidacy = {
      certificationAuthorityLocalAccountOnCandidacy: {
        some: {
          certificationAuthorityLocalAccountId,
        },
      },
    };
  }

  const decisions = (statuses ?? [])
    .map((status) => FEASIBILITY_DECISION_BY_STATUS[status])
    .filter((decision): decision is FeasibilityStatus => Boolean(decision));

  if (decisions.length > 0) {
    baseFilter.isActive = true;
    baseFilter.decision = { in: decisions };
  }

  return Object.keys(baseFilter).length > 0 ? { some: baseFilter } : undefined;
};

const buildValidationFilter = (
  statuses: CandidacyStatusStep[] | undefined,
  certificationAuthorityId?: string,
  certificationAuthorityLocalAccountId?: string,
): Prisma.CandidacyWhereInput["dossierDeValidation"] | undefined => {
  if (!statuses || statuses.length === 0) {
    return undefined;
  }

  const decisions = statuses
    .map((status) => VALIDATION_DECISION_BY_STATUS[status])
    .filter((decision): decision is DossierDeValidationStatus =>
      Boolean(decision),
    );

  if (decisions.length === 0) {
    return undefined;
  }

  const clause: Prisma.DossierDeValidationWhereInput = {
    isActive: true,
    decision: { in: decisions },
  };

  if (certificationAuthorityId) {
    clause.certificationAuthorityId = certificationAuthorityId;
  }

  // For local accounts, also filter by the candidacy link
  if (certificationAuthorityLocalAccountId) {
    clause.candidacy = {
      certificationAuthorityLocalAccountOnCandidacy: {
        some: {
          certificationAuthorityLocalAccountId,
        },
      },
    };
  }

  return { some: clause };
};

const buildJuryStatusClause = (
  juryStatuses: GetCandidaciesForCertificationAuthorityInput["juryStatuses"],
): Prisma.CandidacyWhereInput | undefined => {
  if (!juryStatuses || juryStatuses.length === 0) {
    return undefined;
  }

  const clauses: Prisma.CandidacyWhereInput[] = [];

  juryStatuses.forEach((juryStatus) => {
    if (juryStatus === "TO_SCHEDULE") {
      clauses.push({
        status: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
        Jury: {
          none: {
            isActive: true,
          },
        },
      });
    } else if (juryStatus === "SCHEDULED") {
      clauses.push({
        Jury: {
          some: {
            isActive: true,
            dateOfSession: { gt: new Date() },
          },
        },
      });
    }
  });

  return clauses.length > 0 ? { OR: clauses } : undefined;
};

const buildJuryResultClause = (
  juryResults: GetCandidaciesForCertificationAuthorityInput["juryResults"],
): Prisma.CandidacyWhereInput | undefined => {
  if (!juryResults || juryResults.length === 0) {
    return undefined;
  }

  const hasAwaitingResult = (juryResults as string[]).includes(
    "AWAITING_RESULT",
  );
  const actualResults = juryResults.filter(
    (result) => (result as string) !== "AWAITING_RESULT",
  );

  const clauses: Prisma.CandidacyWhereInput[] = [];

  if (actualResults.length > 0) {
    clauses.push({
      Jury: {
        some: {
          isActive: true,
          result: { in: actualResults },
        },
      },
    });
  }

  if (hasAwaitingResult) {
    clauses.push({
      Jury: {
        some: {
          isActive: true,
          dateOfSession: { lte: new Date() },
          result: null,
        },
      },
    });
  }

  return clauses.length > 0 ? { OR: clauses } : undefined;
};
