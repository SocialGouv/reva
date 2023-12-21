import {
  CertificationAuthorityLocalAccount,
  CertificationAuthorityLocalAccountOnCertification,
  CertificationAuthorityLocalAccountOnDepartment,
  Feasibility,
  FeasibilityStatus,
  Prisma,
} from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import { Account } from "../account/account.types";
import { getAccountByKeycloakId } from "../account/features/getAccountByKeycloakId";
import {
  getCandidaciesFromIds,
  updateCandidacyStatus,
} from "../candidacy/database/candidacies";
import { canManageCandidacy } from "../candidacy/features/canManageCandidacy";
import { getCertificationAuthorityLocalAccountByAccountId } from "../certification-authority/features/getCertificationAuthorityLocalAccountByAccountId";
import { processPaginationInfo } from "../shared/list/pagination";
import { logger } from "../shared/logger";
import {
  FeasibilityFile,
  UploadedFile,
  uploadFeasibilityFiles,
} from "./feasibility.file";
import {
  sendFeasibilityDecisionTakenToAAPEmail,
  sendFeasibilityIncompleteMailToAAP,
  sendFeasibilityRejectedCandidateEmail,
  sendFeasibilityValidatedCandidateEmail,
  sendNewFeasibilitySubmittedEmail,
} from "./feasibility.mails";
import {
  FeasibilityStatusFilter,
  getWhereClauseFromSearchFilter,
  getWhereClauseFromStatusFilter,
} from "./utils/feasibility.helper";

const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";

export const getCertificationAuthorities = ({
  certificationId,
  departmentId,
}: {
  certificationId: string;
  departmentId: string;
}) =>
  certificationId && departmentId
    ? prismaClient.certificationAuthority.findMany({
        where: {
          certificationAuthorityOnDepartment: { some: { departmentId } },
          certificationAuthorityOnCertification: {
            some: { certificationId },
          },
        },
      })
    : [];

export const createFeasibility = async ({
  candidacyId,
  certificationAuthorityId,
  feasibilityFile,
  IDFile,
  documentaryProofFile,
  certificateOfAttendanceFile,
}: {
  candidacyId: string;
  certificationAuthorityId: string;
  feasibilityFile: UploadedFile;
  IDFile: UploadedFile;
  documentaryProofFile?: UploadedFile;
  certificateOfAttendanceFile?: UploadedFile;
}) => {
  const existingFeasibility = await prismaClient.feasibility.findFirst({
    where: { candidacyId, isActive: true },
  });

  if (existingFeasibility) {
    throw new Error(
      "Un dossier de faisabilité actif éxiste déjà pour cette candidature"
    );
  }

  const files: FeasibilityFile[] = [];

  const feasibilityFileInstance = new FeasibilityFile({
    candidacyId: candidacyId,
    fileToUpload: feasibilityFile,
  });
  files.push(feasibilityFileInstance);

  const IDFileInstance = new FeasibilityFile({
    candidacyId: candidacyId,
    fileToUpload: IDFile,
  });
  files.push(IDFileInstance);

  let documentaryProofFileInstance: FeasibilityFile | undefined;
  if (documentaryProofFile) {
    documentaryProofFileInstance = new FeasibilityFile({
      candidacyId: candidacyId,
      fileToUpload: documentaryProofFile,
    });
    files.push(documentaryProofFileInstance);
  }

  let certificateOfAttendanceFileInstance: FeasibilityFile | undefined;
  if (certificateOfAttendanceFile) {
    certificateOfAttendanceFileInstance = new FeasibilityFile({
      candidacyId: candidacyId,
      fileToUpload: certificateOfAttendanceFile,
    });
    files.push(certificateOfAttendanceFileInstance);
  }

  const success = await uploadFeasibilityFiles(files);
  if (!success) {
    throw new Error(
      `Les fichiers du dossiers de faisabilités n'ont pas pu être enregistrés. Veuillez réessayer.`
    );
  }

  const feasibility = await prismaClient.feasibility.create({
    data: {
      candidacy: { connect: { id: candidacyId } },
      certificationAuthority: { connect: { id: certificationAuthorityId } },
      feasibilityFileSentAt: new Date(),
      feasibilityFile: {
        create: {
          id: feasibilityFileInstance.id,
          mimeType: feasibilityFile.mimetype,
          name: feasibilityFile.filename,
        },
      },
      IDFile: {
        create: {
          id: IDFileInstance.id,
          mimeType: IDFile.mimetype,
          name: IDFile.filename,
        },
      },
      documentaryProofFile: documentaryProofFile
        ? {
            create: {
              id: documentaryProofFileInstance?.id,
              mimeType: documentaryProofFile.mimetype,
              name: documentaryProofFile.filename,
            },
          }
        : undefined,
      certificateOfAttendanceFile: certificateOfAttendanceFile
        ? {
            create: {
              id: certificateOfAttendanceFileInstance?.id,
              mimeType: certificateOfAttendanceFile.mimetype,
              name: certificateOfAttendanceFile.filename,
            },
          }
        : undefined,
    },
  });

  await updateCandidacyStatus({
    candidacyId,
    status: "DOSSIER_FAISABILITE_ENVOYE",
  });

  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: {
      department: true,
      certificationsAndRegions: {
        where: { isActive: true },
        include: { certification: true },
      },
    },
  });

  if (
    candidacy?.certificationsAndRegions?.[0]?.certificationId &&
    candidacy?.departmentId
  ) {
    const certificationAuthority = await getCertificationAuthorityById(
      certificationAuthorityId
    );
    if (!certificationAuthority) {
      logger.error(
        `Aucun certificateur trouvé pour la certification ${candidacy?.certificationsAndRegions?.[0]?.certificationId} et le departement : ${candidacy?.departmentId}`
      );
    }
    if (certificationAuthority?.contactEmail) {
      sendNewFeasibilitySubmittedEmail({
        email: certificationAuthority?.contactEmail,
        feasibilityUrl: `${baseUrl}/admin/feasibilities/${feasibility.id}`,
      });
    }
  }

  return feasibility;
};

export const getActiveFeasibilityByCandidacyid = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.feasibility.findFirst({
    where: { candidacyId, isActive: true },
    include: { certificationAuthority: true },
  });

export const getFileNameAndUrl = async ({
  candidacyId,
  fileId,
}: {
  candidacyId: string;
  fileId: string;
}) => {
  if (fileId) {
    const file = await prismaClient.file.findFirst({
      where: { id: fileId },
      select: { name: true },
    });
    return {
      name: file?.name || "",
      url: file
        ? `${process.env.BASE_URL}/api/candidacy/${candidacyId}/feasibility/file/${fileId}`
        : "",
    };
  } else {
    return null;
  }
};

export const getActiveFeasibilityCountByCategory = async ({
  keycloakId,
  hasRole,
  searchFilter,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
  searchFilter?: string;
}) => {
  const feasibilityCountByCategory: Record<FeasibilityStatusFilter, number> = {
    ALL: 0,
    PENDING: 0,
    ADMISSIBLE: 0,
    REJECTED: 0,
    INCOMPLETE: 0,
  };

  if (!hasRole("admin") && !hasRole("manage_feasibility")) {
    throw new Error("Utilisateur non autorisé");
  }

  const account = await getAccountByKeycloakId({ keycloakId });

  const isCertificationAuthorityLocalAccount =
    !hasRole("admin") &&
    !hasRole("manage_certification_authority_local_account");

  const certificationAuthorityLocalAccount =
    isCertificationAuthorityLocalAccount && account
      ? await getCertificationAuthorityLocalAccountByAccountId({
          accountId: account.id,
        })
      : null;

  await Promise.all(
    (Object.keys(feasibilityCountByCategory) as FeasibilityStatusFilter[]).map(
      async (statusFilter) => {
        try {
          const value: number = await new Promise((resolve, reject) => {
            {
              let whereClause: Prisma.FeasibilityWhereInput = {};

              if (!hasRole("admin") && hasRole("manage_feasibility")) {
                whereClause = {
                  ...whereClause,
                  ...getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole(
                    {
                      account,
                      isCertificationAuthorityLocalAccount,
                      certificationAuthorityLocalAccount,
                    }
                  ),
                };
              }

              const candidacyClause: Prisma.CandidacyWhereInput =
                whereClause?.candidacy || {};

              whereClause = {
                ...whereClause,
                ...getWhereClauseFromStatusFilter(statusFilter),
                candidacy: {
                  ...candidacyClause,
                  ...getWhereClauseFromSearchFilter(searchFilter),
                },
              };

              prismaClient.feasibility
                .count({
                  where: whereClause,
                })
                .then((value) => {
                  resolve(value);
                })
                .catch(() => {
                  reject();
                });
            }
          });

          feasibilityCountByCategory[statusFilter] = value;
        } catch (error) {
          console.error(error);
        }
      }
    )
  );

  return feasibilityCountByCategory;
};

const getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole = ({
  account,
  isCertificationAuthorityLocalAccount,
  certificationAuthorityLocalAccount,
}: {
  account: Account | null;
  isCertificationAuthorityLocalAccount: boolean;
  certificationAuthorityLocalAccount:
    | (CertificationAuthorityLocalAccount & {
        certificationAuthorityLocalAccountOnDepartment: CertificationAuthorityLocalAccountOnDepartment[];
        certificationAuthorityLocalAccountOnCertification: CertificationAuthorityLocalAccountOnCertification[];
      })
    | null;
}) => {
  let queryWhereClause = {};
  // For certification authority local accounts we restric matches to the local account own departments and certifications
  if (isCertificationAuthorityLocalAccount) {
    if (!certificationAuthorityLocalAccount) {
      throw new Error(
        "Compte local de l'autorité de certification non trouvée"
      );
    }

    const departmentIds =
      certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnDepartment.map(
        (calad) => calad.departmentId
      );
    const certificationIds =
      certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnCertification.map(
        (calac) => calac.certificationId
      );

    queryWhereClause = {
      ...queryWhereClause,
      certificationAuthorityId:
        certificationAuthorityLocalAccount?.certificationAuthorityId,
      candidacy: {
        departmentId: { in: departmentIds },
        certificationsAndRegions: {
          some: { isActive: true, certificationId: { in: certificationIds } },
        },
      },
    };
  } else {
    queryWhereClause = {
      ...queryWhereClause,
      certificationAuthorityId: account?.certificationAuthorityId || "_",
    };
  }
  return queryWhereClause;
};

export const getActiveFeasibilities = async ({
  keycloakId,
  hasRole,
  limit = 10,
  offset = 0,
  decision,
  searchFilter,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
  limit?: number;
  offset?: number;
  decision?: FeasibilityStatus;
  searchFilter?: string;
}): Promise<PaginatedListResult<Feasibility>> => {
  let queryWhereClause: Prisma.FeasibilityFindManyArgs["where"] = decision
    ? { decision, isActive: decision !== "INCOMPLETE" }
    : {
        OR: [
          {
            isActive: true,
          },
          {
            isActive: false,
            decision: "INCOMPLETE",
          },
        ],
      };

  //only list feasibilties linked to the account certification authority
  if (hasRole("manage_feasibility")) {
    const account = await prismaClient.account.findFirstOrThrow({
      where: { keycloakId },
    });

    const isCertificationAuthorityLocalAccount = !hasRole(
      "manage_certification_authority_local_account"
    );

    const certificationAuthorityLocalAccount =
      isCertificationAuthorityLocalAccount
        ? await getCertificationAuthorityLocalAccountByAccountId({
            accountId: account.id,
          })
        : null;

    queryWhereClause = {
      ...queryWhereClause,
      ...getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole({
        account,
        isCertificationAuthorityLocalAccount,
        certificationAuthorityLocalAccount,
      }),
    };
  } else if (!hasRole("admin")) {
    //admin has access to everything
    throw new Error("Utilisateur non autorisé");
  }

  if (searchFilter && searchFilter.length > 0) {
    const candidacyClause: Prisma.CandidacyWhereInput =
      queryWhereClause?.candidacy || ({} as const);
    queryWhereClause = {
      ...queryWhereClause,
      candidacy: {
        ...candidacyClause,
        ...getWhereClauseFromSearchFilter(searchFilter),
      },
    };
  }

  const rows = await prismaClient.feasibility.findMany({
    where: queryWhereClause,
    skip: offset,
    take: limit,
    orderBy: [{ createdAt: "desc" }],
  });

  const totalRows = await prismaClient.feasibility.count({
    where: queryWhereClause,
  });

  const page = {
    rows,
    info: processPaginationInfo({
      limit: limit,
      offset: offset,
      totalRows,
    }),
  };

  return page;
};

export const getCandidaciesByIds = async ({
  candidacyIds,
}: {
  candidacyIds: string[];
}) => {
  return getCandidaciesFromIds(candidacyIds);
};

export const getFeasibilityById = async ({
  feasibilityId,
  hasRole,
  keycloakId,
}: {
  feasibilityId: string;
  hasRole: (role: string) => boolean;
  keycloakId: string;
}) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: { id: feasibilityId },
    include: {
      certificationAuthority: true,
    },
  });

  const authorized = await canManageFeasibility({
    hasRole,
    feasibility,
    keycloakId,
  });

  if (hasRole("admin") || authorized) {
    return feasibility;
  } else {
    throw new Error("Vous n'êtes pas autorisé à consulter ce dossier");
  }
};

const deleteFeasibilityIDFile = async (feasibilityId: string) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: { id: feasibilityId },
  });

  if (feasibility?.IDFileId) {
    await prismaClient.file.delete({
      where: {
        id: feasibility.IDFileId,
      },
    });

    const file = new FeasibilityFile({
      fileId: feasibility.IDFileId,
      candidacyId: feasibility.candidacyId,
    });

    await file.delete();
  }
};

export const validateFeasibility = async ({
  feasibilityId,
  comment,
  hasRole,
  keycloakId,
  infoFile,
}: {
  feasibilityId: string;
  comment?: string;
  hasRole: (role: string) => boolean;
  keycloakId: string;
  infoFile?: UploadedFile;
}) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: { id: feasibilityId },
  });

  const authorized = await canManageFeasibility({
    hasRole,
    feasibility,
    keycloakId,
  });

  if (hasRole("admin") || authorized) {
    const updatedFeasibility = await prismaClient.feasibility.update({
      where: { id: feasibilityId },
      data: {
        decision: "ADMISSIBLE",
        decisionComment: comment,
        decisionSentAt: new Date(),
      },
      include: {
        candidacy: {
          include: {
            certificationsAndRegions: {
              where: { isActive: true },
              include: { certification: { select: { label: true } } },
            },
            candidate: {
              select: {
                email: true,
              },
            },
            organism: { select: { contactAdministrativeEmail: true } },
          },
        },
        certificationAuthority: true,
      },
    });

    await updateCandidacyStatus({
      candidacyId: feasibility?.candidacyId || "",
      status: "DOSSIER_FAISABILITE_RECEVABLE",
    });

    const activeCertificationAndRegion =
      updatedFeasibility.candidacy.certificationsAndRegions[0];

    sendFeasibilityValidatedCandidateEmail({
      email: updatedFeasibility.candidacy.candidate?.email as string,
      certifName: activeCertificationAndRegion.certification.label,
      comment,
      certificationAuthorityLabel:
        updatedFeasibility.certificationAuthority.label ||
        "certificateur inconnu",
      infoFile,
    });

    if (updatedFeasibility.candidacy.organism?.contactAdministrativeEmail) {
      sendFeasibilityDecisionTakenToAAPEmail({
        email:
          updatedFeasibility.candidacy.organism?.contactAdministrativeEmail,
        feasibilityUrl: `${baseUrl}/admin/candidacies/${updatedFeasibility.candidacyId}/feasibility`,
      });
    }

    // Delete ID File from feasibility
    deleteFeasibilityIDFile(feasibilityId);

    return updatedFeasibility;
  } else {
    throw new Error("Utilisateur non autorisé");
  }
};

export const rejectFeasibility = async ({
  feasibilityId,
  comment,
  hasRole,
  keycloakId,
  infoFile,
}: {
  feasibilityId: string;
  comment?: string;
  hasRole: (role: string) => boolean;
  keycloakId: string;
  infoFile?: UploadedFile;
}) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: { id: feasibilityId },
  });

  const authorized = await canManageFeasibility({
    hasRole,
    feasibility,
    keycloakId,
  });

  if (hasRole("admin") || authorized) {
    const updatedFeasibility = await prismaClient.feasibility.update({
      where: { id: feasibilityId },
      data: {
        decision: "REJECTED",
        decisionComment: comment,
        decisionSentAt: new Date(),
      },
      include: {
        candidacy: {
          include: {
            candidate: {
              select: { email: true },
            },
            organism: { select: { contactAdministrativeEmail: true } },
          },
        },
        certificationAuthority: true,
      },
    });

    await updateCandidacyStatus({
      candidacyId: feasibility?.candidacyId || "",
      status: "DOSSIER_FAISABILITE_NON_RECEVABLE",
    });

    sendFeasibilityRejectedCandidateEmail({
      email: updatedFeasibility.candidacy.candidate?.email as string,
      comment,
      certificationAuthorityLabel:
        updatedFeasibility.certificationAuthority.label ||
        "certificateur inconnu",
      infoFile,
    });

    if (updatedFeasibility.candidacy.organism?.contactAdministrativeEmail) {
      sendFeasibilityDecisionTakenToAAPEmail({
        email:
          updatedFeasibility.candidacy.organism?.contactAdministrativeEmail,
        feasibilityUrl: `${baseUrl}/admin/candidacies/${updatedFeasibility.candidacy.id}/feasibility`,
      });
    }

    // Delete ID File from feasibility
    deleteFeasibilityIDFile(feasibilityId);

    return updatedFeasibility;
  } else {
    throw new Error("Utilisateur non autorisé");
  }
};

export const markFeasibilityAsIncomplete = async ({
  feasibilityId,
  comment,
  hasRole,
  keycloakId,
}: {
  feasibilityId: string;
  comment?: string;
  hasRole: (role: string) => boolean;
  keycloakId: string;
}) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: { id: feasibilityId },
  });

  const authorized = await canManageFeasibility({
    hasRole,
    feasibility,
    keycloakId,
  });

  if (feasibility && (hasRole("admin") || authorized)) {
    const updatedFeasibility = await prismaClient.feasibility.update({
      where: { id: feasibilityId },
      data: {
        decision: "INCOMPLETE",
        decisionComment: comment,
        decisionSentAt: new Date(),
        isActive: false,
      },
      include: {
        candidacy: {
          include: {
            certificationsAndRegions: {
              where: { isActive: true },
            },
            candidate: {
              select: { email: true },
            },
            organism: { select: { contactAdministrativeEmail: true } },
          },
        },
      },
    });

    await updateCandidacyStatus({
      candidacyId: feasibility?.candidacyId || "",
      status: "DOSSIER_FAISABILITE_INCOMPLET",
    });

    if (updatedFeasibility.candidacy.organism?.contactAdministrativeEmail) {
      sendFeasibilityIncompleteMailToAAP({
        email:
          updatedFeasibility.candidacy.organism?.contactAdministrativeEmail,
        feasibilityUrl: `${baseUrl}/admin/candidacies/${updatedFeasibility.candidacy.id}/feasibility`,
        comment,
      });
    }

    // Delete ID File from feasibility
    deleteFeasibilityIDFile(feasibilityId);

    return updatedFeasibility;
  } else {
    throw new Error("Utilisateur non autorisé");
  }
};

export const canDownloadFeasibilityFiles = async ({
  hasRole,
  feasibility,
  keycloakId,
}: {
  hasRole(role: string): boolean;
  feasibility: Feasibility | null;
  keycloakId: string;
}) => {
  return (
    canUserManageCandidacy ||
    canManageFeasibility({ hasRole, feasibility, keycloakId })
  );
};

export const canManageFeasibility = async ({
  hasRole,
  feasibility,
  keycloakId,
}: {
  hasRole(role: string): boolean;
  feasibility: Feasibility | null;
  keycloakId: string;
}) => {
  if (feasibility == null) {
    throw new Error("Ce dossier est introuvable");
  }

  //admins can manage everything
  if (hasRole("admin")) {
    return true;
  } else if (hasRole("manage_feasibility")) {
    //certification authority admin account
    if (hasRole("manage_certification_authority_local_account")) {
      //is user account attached to a certification authority which manage the candidacy certification ?
      return !!(await prismaClient.account.findFirst({
        where: {
          keycloakId,
          certificationAuthorityId: feasibility.certificationAuthorityId,
        },
        select: { id: true },
      }));
    }
    //certification authority local account
    //check if candidacy department and certification are in the local account access perimeter
    else {
      const account = await getAccountByKeycloakId({ keycloakId });
      if (!account) {
        throw new Error("Compte utilisateur non trouvé");
      }
      const certificationAuthorityLocalAccount =
        await getCertificationAuthorityLocalAccountByAccountId({
          accountId: account.id,
        });

      if (!certificationAuthorityLocalAccount) {
        throw new Error(
          "Compte local de l'autorité de certification non trouvé"
        );
      }

      if (
        certificationAuthorityLocalAccount.certificationAuthorityId !==
        feasibility.certificationAuthorityId
      ) {
        throw new Error("Vous n'êtes pas autorisé à consulter ce dossier");
      }

      const departmentIds =
        certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnDepartment.map(
          (calad) => calad.departmentId
        );

      const certificationIds =
        certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnCertification.map(
          (calac) => calac.certificationId
        );

      return !!(await prismaClient.feasibility.findFirst({
        where: {
          id: feasibility.id,
          certificationAuthorityId:
            certificationAuthorityLocalAccount.certificationAuthorityId,
          candidacy: {
            departmentId: { in: departmentIds },
            certificationsAndRegions: {
              some: {
                isActive: true,
                certificationId: { in: certificationIds },
              },
            },
          },
        },
      }));
    }
  }

  return false;
};

export const canUserManageCandidacy = async ({
  hasRole,
  candidacyId,
  keycloakId,
}: {
  hasRole(role: string): boolean;
  candidacyId: string;
  keycloakId: string;
}) =>
  await canManageCandidacy({
    hasRole,
    candidacyId,
    keycloakId,
  });

export const getCertificationAuthorityById = async (id: string) => {
  return await prismaClient.certificationAuthority.findUnique({
    where: {
      id,
    },
  });
};

export const handleFeasibilityDecision = async (args: {
  feasibilityId: string;
  decision: string;
  comment?: string;
  hasRole: (role: string) => boolean;
  keycloakId: string;
  infoFile?: UploadedFile;
}) => {
  const { decision, ...otherParameters } = args;
  switch (decision) {
    case "Admissible":
      return validateFeasibility(otherParameters);
    case "Rejected":
      return rejectFeasibility(otherParameters);
    case "Incomplete":
      return markFeasibilityAsIncomplete(otherParameters);

    default:
      throw new Error(
        `La décision ${decision} est invalide pour le dossier de faisabilité`
      );
  }
};
