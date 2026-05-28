import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
  DossierDeValidationStatus,
  Prisma,
} from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { getWhereClauseFromSearchFilter } from "@/modules/shared/search/search";
import { prismaClient } from "@/prisma/client";

import {
  DossierDeValidationStatusFilter,
  FeasibilityStatusFilter,
  GetCandidaciesForAAPInput,
  GetCandidaciesForCertificationAuthorityInput,
  JuryStatusFilter,
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

const ALLOWED_TRAINING_STATUS: CandidacyStatusStep[] = [
  CandidacyStatusStep.PARCOURS_ENVOYE,
  CandidacyStatusStep.PARCOURS_CONFIRME,
];

export const getCandidaciesForAAP = async ({
  context,
  offset = 0,
  limit = 10000,
  searchFilter,
  sortByFilter,
  candidacyStatuses,
  trainingStatuses,
  feasibilityStatuses,
  dossierDeValidationStatuses,
  juryStatuses,
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

  // Candidacy status filter
  if (candidacyStatuses && candidacyStatuses.length > 0) {
    const allowedCandidacyStatuses = isAdmin
      ? ALLOWED_CANDIDACY_STATUS_FOR_ADMIN_USERS
      : ALLOWED_CANDIDACY_STATUS_FOR_NON_ADMIN_USERS;

    for (const status of candidacyStatuses) {
      if (!allowedCandidacyStatuses.includes(status)) {
        throw new Error(`Le filtre candidacy: '${status}' n'est pas autorisé`);
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

  // Training status filter
  if (trainingStatuses && trainingStatuses.length > 0) {
    const allowedTrainingStatuses = ALLOWED_TRAINING_STATUS;

    for (const status of trainingStatuses) {
      if (!allowedTrainingStatuses.includes(status)) {
        throw new Error(`Le filtre training: '${status}' n'est pas autorisé`);
      }
    }

    andClauses.push({
      candidacy: {
        status: {
          in: trainingStatuses,
        },
      },
    });
  }

  // Feasibility status filter
  if (feasibilityStatuses && feasibilityStatuses.length > 0) {
    const feasibilityWhereInput: Prisma.CandidacyWithLastActiveDfDvJuryWhereInput[] =
      [];

    if (
      feasibilityStatuses.includes(FeasibilityStatusFilter.ENVOYE_AU_CANDIDAT)
    ) {
      feasibilityWhereInput.push({
        feasibility: {
          dematerializedFeasibilityFile: {
            sentToCandidateAt: { not: null },
          },
        },
      });
    }

    if (
      feasibilityStatuses.includes(
        FeasibilityStatusFilter.PARTIELLEMENT_VALIDE_PAR_LE_CANDIDAT,
      )
    ) {
      feasibilityWhereInput.push({
        feasibility: {
          dematerializedFeasibilityFile: {
            candidateConfirmationAt: { not: null },
            swornStatementFileId: null,
          },
        },
      });
    }

    if (
      feasibilityStatuses.includes(
        FeasibilityStatusFilter.VALIDE_PAR_LE_CANDIDAT,
      )
    ) {
      feasibilityWhereInput.push({
        feasibility: {
          dematerializedFeasibilityFile: {
            candidateConfirmationAt: { not: null },
            swornStatementFileId: { not: null },
          },
        },
      });
    }

    if (
      feasibilityStatuses.includes(
        FeasibilityStatusFilter.ENVOYE_AU_CERTIFICATEUR,
      )
    ) {
      feasibilityWhereInput.push({
        feasibility: {
          decision: "PENDING",
        },
      });
    }

    if (feasibilityStatuses.includes(FeasibilityStatusFilter.INCOMPLET)) {
      feasibilityWhereInput.push({
        feasibility: {
          decision: "INCOMPLETE",
        },
      });
    }

    if (feasibilityStatuses.includes(FeasibilityStatusFilter.RECEVABLE)) {
      feasibilityWhereInput.push({
        feasibility: {
          decision: "ADMISSIBLE",
        },
      });
    }

    andClauses.push({
      OR: feasibilityWhereInput,
    });
  }

  // Dossier de validation status filter
  if (dossierDeValidationStatuses && dossierDeValidationStatuses.length > 0) {
    const dossierDeValidationWhereInput: Prisma.CandidacyWithLastActiveDfDvJuryWhereInput[] =
      [];

    if (
      dossierDeValidationStatuses.includes(
        DossierDeValidationStatusFilter.TRANSMETTRE,
      )
    ) {
      dossierDeValidationWhereInput.push({
        feasibility: {
          decision: "ADMISSIBLE",
        },
        dossierDeValidation: null,
      });
    }
    if (
      dossierDeValidationStatuses.includes(
        DossierDeValidationStatusFilter.ENVOYE,
      )
    ) {
      dossierDeValidationWhereInput.push({
        dossierDeValidation: {
          decision: "PENDING",
        },
      });
    }
    if (
      dossierDeValidationStatuses.includes(
        DossierDeValidationStatusFilter.SIGNALE,
      )
    ) {
      dossierDeValidationWhereInput.push({
        dossierDeValidation: {
          decision: "INCOMPLETE",
        },
      });
    }

    andClauses.push({
      OR: dossierDeValidationWhereInput,
    });
  }

  // Jury status filter
  if (juryStatuses && juryStatuses.length > 0) {
    const juryWhereInput: Prisma.CandidacyWithLastActiveDfDvJuryWhereInput[] =
      [];

    if (juryStatuses.includes(JuryStatusFilter.TO_SCHEDULE)) {
      juryWhereInput.push({
        dossierDeValidation: {
          decision: {
            in: [
              DossierDeValidationStatus.PENDING,
              DossierDeValidationStatus.COMPLETE,
            ],
          },
        },
        jury: null,
      });
    }
    if (juryStatuses.includes(JuryStatusFilter.SCHEDULED)) {
      juryWhereInput.push({
        jury: {
          dateOfSession: { gt: new Date() },
        },
      });
    }
    if (juryStatuses.includes(JuryStatusFilter.PASSED)) {
      juryWhereInput.push({
        jury: {
          dateOfSession: { lt: new Date() },
        },
      });
    }

    andClauses.push({ OR: juryWhereInput });
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
