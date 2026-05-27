import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
  Prisma,
} from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { getWhereClauseFromSearchFilter } from "@/modules/shared/search/search";
import { prismaClient } from "@/prisma/client";

import {
  GetCandidaciesForAAPInput,
  GetCandidaciesForCertificationAuthorityInput,
} from "../candidacy.types";
import { candidacySearchWord } from "../utils/candidacy.helper";

const ALLOWED_CANDIDACY_STATUS_FOR_NON_ADMIN_USERS: CandidacyStatusStep[] = [
  CandidacyStatusStep.VALIDATION,
  CandidacyStatusStep.PRISE_EN_CHARGE,
];

const ALLOWED_CANDIDACY_STATUS_FOR_ADMIN_USERS: CandidacyStatusStep[] = [
  CandidacyStatusStep.PROJET,
  CandidacyStatusStep.VALIDATION,
  CandidacyStatusStep.PRISE_EN_CHARGE,
];

export const getCandidaciesForAAP = async ({
  context,
  offset = 0,
  limit = 10000,
  searchFilter,
  sortByFilter,
  candidacyStatuses,
}: GetCandidaciesForAAPInput & {
  context: GraphqlContext;
}) => {
  const isAdmin = context.auth.hasRole("admin");
  const keycloakId = context.auth.userInfo?.sub;

  // Dropout filter: only get candidacies without dropout and end accompagnement not confirmed by candidate or admin
  const andClauses: Prisma.CandidacyWithLastActiveDfDvJuryWhereInput[] = [
    {
      candidacy: {
        candidateId: { not: null },
        candidacyDropOut: null,
        endAccompagnementStatus: {
          notIn: ["CONFIRMED_BY_CANDIDATE", "CONFIRMED_BY_ADMIN"],
        },
      },
    },
  ];

  // Filters for non-admin users
  if (!isAdmin && keycloakId) {
    andClauses.push({
      candidacy: {
        organism: {
          OR: [
            {
              organismOnAccounts: {
                some: {
                  account: {
                    keycloakId: keycloakId,
                  },
                },
              },
            },
            {
              maisonMereAAP: {
                gestionnaire: {
                  keycloakId: keycloakId,
                },
              },
            },
          ],
        },
      },
    });
  }

  // Search filter
  if (searchFilter) {
    andClauses.push({
      candidacy: {
        ...getWhereClauseFromSearchFilter(candidacySearchWord, searchFilter),
      },
    });
  }

  // Status filter
  if (candidacyStatuses && candidacyStatuses.length > 0) {
    const allowedCandidacyStatuses = isAdmin
      ? ALLOWED_CANDIDACY_STATUS_FOR_ADMIN_USERS
      : ALLOWED_CANDIDACY_STATUS_FOR_NON_ADMIN_USERS;

    for (const status of candidacyStatuses) {
      if (!allowedCandidacyStatuses.includes(status)) {
        throw new Error(`Le filtre ${status} n'est pas autorisé`);
      }
    }

    if (candidacyStatuses.includes(CandidacyStatusStep.PROJET)) {
      andClauses.push({
        candidacy: {
          OR: [
            {
              status: CandidacyStatusStep.PROJET,
              typeAccompagnement: CandidacyTypeAccompagnement.AUTONOME,
            },
            {
              status: {
                in: allowedCandidacyStatuses.filter(
                  (status) => status !== CandidacyStatusStep.PROJET,
                ),
              },
            },
          ],
        },
      });
    } else {
      andClauses.push({
        candidacy: {
          status: {
            in: candidacyStatuses,
          },
        },
      });
    }
  }

  const whereClause: Prisma.CandidacyWithLastActiveDfDvJuryWhereInput =
    andClauses.length === 1 ? andClauses[0] : { AND: andClauses };

  const totalRows = await prismaClient.candidacyWithLastActiveDfDvJury.count({
    where: whereClause,
  });

  const orderByClause = getOrderByClauseFromSortByFilter(sortByFilter);

  const candidacies =
    await prismaClient.candidacyWithLastActiveDfDvJury.findMany({
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
  sortByFilter: GetCandidaciesForCertificationAuthorityInput["sortByFilter"] = "DATE_CREATION_DESC",
):
  | Prisma.CandidacyWithLastActiveDfDvJuryOrderByWithRelationInput
  | Prisma.CandidacyWithLastActiveDfDvJuryOrderByWithRelationInput[]
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
    return [
      {
        feasibility: { feasibilityFileSentAt: { sort: "desc", nulls: "last" } },
      },
    ];
  }
  if (sortByFilter === "DOSSIER_DE_FAISABILITE_ENVOYE_ASC") {
    return [
      {
        feasibility: { feasibilityFileSentAt: { sort: "asc", nulls: "last" } },
      },
    ];
  }
  if (sortByFilter === "DOSSIER_DE_VALIDATION_ENVOYE_DESC") {
    return [
      {
        dossierDeValidation: {
          dossierDeValidationSentAt: { sort: "desc", nulls: "last" },
        },
      },
    ];
  }
  if (sortByFilter === "DOSSIER_DE_VALIDATION_ENVOYE_ASC") {
    return [
      {
        dossierDeValidation: {
          dossierDeValidationSentAt: { sort: "asc", nulls: "last" },
        },
      },
    ];
  }
  if (sortByFilter === "JURY_PROGRAMME_DESC") {
    return [{ jury: { dateOfSession: "desc" } }];
  }
  if (sortByFilter === "JURY_PROGRAMME_ASC") {
    return [{ jury: { dateOfSession: "asc" } }];
  }

  return undefined;
};
