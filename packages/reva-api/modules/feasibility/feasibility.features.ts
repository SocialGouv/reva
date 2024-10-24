import {
  CandidacyStatusStep,
  CertificationAuthorityLocalAccount,
  CertificationAuthorityLocalAccountOnCertification,
  CertificationAuthorityLocalAccountOnDepartment,
  Feasibility,
  FeasibilityStatus,
  Prisma,
} from "@prisma/client";

import { v4 } from "uuid";
import { prismaClient } from "../../prisma/client";
import { Account } from "../account/account.types";
import { getAccountById } from "../account/features/getAccount";
import { getAccountByKeycloakId } from "../account/features/getAccountByKeycloakId";
import { logCandidacyAuditEvent } from "../candidacy-log/features/logCandidacyAuditEvent";
import { getCertificationByCandidacyId } from "../candidacy/certification/features/getCertificationByCandidacyId";
import { canManageCandidacy } from "../candidacy/features/canManageCandidacy";
import { updateCandidacyStatus } from "../candidacy/features/updateCandidacyStatus";
import { candidacySearchWord } from "../candidacy/utils/candidacy.helper";
import { getCertificationAuthorityLocalAccountByAccountId } from "../certification-authority/features/getCertificationAuthorityLocalAccountByAccountId";
import { getCertificationAuthorityLocalAccountByCertificationAuthorityIdCertificationAndDepartment } from "../certification-authority/features/getCertificationAuthorityLocalAccountByCertificationAuthorityIdCertificationAndDepartment";
import {
  FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
  OOS_DOMAIN,
  S3File,
  UploadedFile,
  deleteFile,
  getDownloadLink,
  uploadFileToS3,
  uploadFilesToS3,
} from "../shared/file";
import { processPaginationInfo } from "../shared/list/pagination";
import { logger } from "../shared/logger";
import { getWhereClauseFromSearchFilter } from "../shared/search/search";
import {
  sendFeasibilityDecisionTakenToAAPEmail,
  sendFeasibilityIncompleteMailToAAP,
  sendFeasibilityRejectedToCandidateAccompagneEmail,
  sendFeasibilityRejectedToCandidateAutonomeEmail,
  sendFeasibilityValidatedToCandidateAccompagneEmail,
  sendFeasibilityValidatedToCandidateAutonomeEmail,
  sendNewFeasibilitySubmittedEmail,
} from "./emails";
import { FeasibilityCategoryFilter } from "./feasibility.types";
import {
  FeasibilityStatusFilter,
  excludeArchivedAndDroppedOutCandidacy,
  excludeRejectedArchivedDraftAndDroppedOutCandidacy,
  getWhereClauseFromStatusFilter,
} from "./utils/feasibility.helper";

const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";

export const getCertificationAuthorities = async ({
  candidacyId,
  departmentId,
}: {
  candidacyId: string;
  departmentId: string;
}) => {
  const certification = await getCertificationByCandidacyId({ candidacyId });

  return certification && departmentId
    ? prismaClient.certificationAuthority.findMany({
        where: {
          certificationAuthorityOnDepartment: { some: { departmentId } },
          certificationAuthorityOnCertification: {
            some: { certificationId: certification.id },
          },
        },
      })
    : [];
};

export const createFeasibility = async ({
  candidacyId,
  certificationAuthorityId,
  feasibilityFile,
  IDFile,
  documentaryProofFile,
  certificateOfAttendanceFile,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  certificationAuthorityId: string;
  feasibilityFile: UploadedFile;
  IDFile: UploadedFile;
  documentaryProofFile?: UploadedFile;
  certificateOfAttendanceFile?: UploadedFile;
  userKeycloakId?: string;
  userEmail: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const allowedStatuesAccompagne: CandidacyStatusStep[] = [
    "PARCOURS_CONFIRME",
    "DOSSIER_FAISABILITE_INCOMPLET",
  ];
  const allowedStatuesAutonome: CandidacyStatusStep[] = [
    "PROJET",
    "DOSSIER_FAISABILITE_INCOMPLET",
  ];

  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: {
      department: true,
    },
  });

  const lastStatus = candidacy?.status;

  if (!lastStatus) {
    throw new Error("La candidature n'a aucun statut actif");
  }

  if (
    candidacy.typeAccompagnement === "ACCOMPAGNE" &&
    !allowedStatuesAccompagne.includes(lastStatus)
  ) {
    throw new Error(
      `Le statut de la candidature doit être en "PARCOURS_CONFIRME" ou "DOSSIER_FAISABILITE_INCOMPLET" pour envoyer un dossier de faisabilité.`,
    );
  }

  if (
    candidacy.typeAccompagnement === "AUTONOME" &&
    !allowedStatuesAutonome.includes(lastStatus)
  ) {
    throw new Error(
      `Le statut de la candidature doit être en "PROJET" ou "DOSSIER_FAISABILITE_INCOMPLET" pour envoyer un dossier de faisabilité.`,
    );
  }

  const existingFeasibilityUploadedPdf =
    await prismaClient.feasibility.findFirst({
      where: {
        candidacyId,
        isActive: true,
        feasibilityFormat: "UPLOADED_PDF",
      },
    });

  const isFeasibilityEditableDecision = ["INCOMPLETE", "DRAFT"];

  if (
    existingFeasibilityUploadedPdf &&
    !isFeasibilityEditableDecision.includes(
      existingFeasibilityUploadedPdf.decision,
    )
  ) {
    throw new Error(
      "Un dossier de faisabilité actif existe déjà pour cette candidature",
    );
  }

  const files: S3File[] = [];

  const feasibilityFileInstance: S3File = {
    filePath: `candidacies/${candidacyId}/feasibility/${v4()}`,
    data: feasibilityFile._buf,
    mimeType: feasibilityFile.mimetype,
  };
  files.push(feasibilityFileInstance);

  const IDFileInstance: S3File = {
    filePath: `candidacies/${candidacyId}/feasibility/${v4()}`,
    data: IDFile._buf,
    mimeType: IDFile.mimetype,
  };
  files.push(IDFileInstance);

  let documentaryProofFileInstance: S3File | undefined;
  if (documentaryProofFile) {
    documentaryProofFileInstance = {
      filePath: `candidacies/${candidacyId}/feasibility/${v4()}`,
      data: documentaryProofFile._buf,
      mimeType: documentaryProofFile.mimetype,
    };
    files.push(documentaryProofFileInstance);
  }

  let certificateOfAttendanceFileInstance: S3File | undefined;
  if (certificateOfAttendanceFile) {
    certificateOfAttendanceFileInstance = {
      filePath: `candidacies/${candidacyId}/feasibility/${v4()}`,
      data: certificateOfAttendanceFile._buf,
      mimeType: certificateOfAttendanceFile.mimetype,
    };
    files.push(certificateOfAttendanceFileInstance);
  }

  await uploadFilesToS3(files);

  const feasibilityUploadedPdfData = {
    feasibilityFile: {
      create: {
        mimeType: feasibilityFile.mimetype,
        name: feasibilityFile.filename,
        path: feasibilityFileInstance.filePath,
      },
    },
    IDFile: {
      create: {
        mimeType: IDFile.mimetype,
        name: IDFile.filename,
        path: IDFileInstance.filePath,
      },
    },
    documentaryProofFile: documentaryProofFile
      ? {
          create: {
            mimeType: documentaryProofFile.mimetype,
            name: documentaryProofFile.filename,
            path: documentaryProofFileInstance?.filePath,
          },
        }
      : undefined,
    certificateOfAttendanceFile: certificateOfAttendanceFile
      ? {
          create: {
            mimeType: certificateOfAttendanceFile.mimetype,
            name: certificateOfAttendanceFile.filename,
            path: certificateOfAttendanceFileInstance?.filePath,
          },
        }
      : undefined,
  } as Prisma.FeasibilityUploadedPdfCreateInput;

  const feasibilityData = {
    decision: "PENDING",
    isActive: true,
    candidacy: { connect: { id: candidacyId } },
    certificationAuthority: { connect: { id: certificationAuthorityId } },
    feasibilityFileSentAt: new Date(),
    feasibilityFormat: "UPLOADED_PDF",
  } as Prisma.FeasibilityCreateInput;

  let feasibility;

  await prismaClient.feasibility.updateMany({
    where: { candidacyId },
    data: { isActive: false },
  });

  if (existingFeasibilityUploadedPdf?.decision === "DRAFT") {
    feasibility = await prismaClient.feasibility.update({
      where: { id: existingFeasibilityUploadedPdf.id },
      data: {
        ...feasibilityData,
        feasibilityUploadedPdf: {
          upsert: {
            create: feasibilityUploadedPdfData,
            update: feasibilityUploadedPdfData,
          },
        },
      },
    });
  } else {
    feasibility = await prismaClient.feasibility.create({
      data: {
        ...feasibilityData,
        feasibilityUploadedPdf: { create: feasibilityUploadedPdfData },
      },
    });
  }

  await updateCandidacyStatus({
    candidacyId,
    status: "DOSSIER_FAISABILITE_ENVOYE",
  });

  const candidacyCertificationId = candidacy?.certificationId;
  const candidacyDepartmentId = candidacy?.departmentId;

  if (candidacyCertificationId && candidacyDepartmentId) {
    const certificationAuthority = await getCertificationAuthorityById(
      certificationAuthorityId,
    );
    if (!certificationAuthority) {
      logger.error(
        `Aucun certificateur trouvé pour la certification ${candidacyCertificationId} et le département : ${candidacyDepartmentId}`,
      );
    }
    //sending a mail notification to candidacy certification authority and related certification authority local accounts

    const certificationAuthorityLocalAccounts =
      await getCertificationAuthorityLocalAccountByCertificationAuthorityIdCertificationAndDepartment(
        {
          certificationAuthorityId,
          certificationId: candidacyCertificationId,
          departmentId: candidacyDepartmentId,
        },
      );
    const emails = [];
    if (certificationAuthority?.contactEmail) {
      emails.push(certificationAuthority?.contactEmail);
    }
    for (const cala of certificationAuthorityLocalAccounts) {
      const account = await getAccountById({ id: cala.accountId });
      emails.push(account.email);
    }
    if (emails.length) {
      sendNewFeasibilitySubmittedEmail({
        emails,
        feasibilityUrl: `${baseUrl}/admin2/candidacies/${candidacy.id}/feasibility`,
      });
    }
  }

  await logCandidacyAuditEvent({
    candidacyId,
    userKeycloakId,
    userEmail,
    userRoles,
    eventType: "FEASIBILITY_SENT",
  });

  return feasibility;
};

export const getActiveFeasibilityByCandidacyid = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.feasibility.findFirst({
    where: { candidacyId, isActive: true },
    include: {
      certificationAuthority: true,
      feasibilityUploadedPdf: true,
      dematerializedFeasibilityFile: true,
    },
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
      select: { name: true, path: true },
    });

    if (!file) {
      throw new Error("Fichier non trouvé");
    }
    const downloadUrl = await getDownloadLink(file?.path);

    return {
      name: file?.name || "",
      url: file
        ? `${process.env.BASE_URL}/api/candidacy/${candidacyId}/feasibility/file/${fileId}`
        : "",
      previewUrl: downloadUrl?.replace(
        OOS_DOMAIN,
        FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
      ),
    };
  } else {
    return null;
  }
};

export const getActiveFeasibilityCountByCategory = async ({
  keycloakId,
  hasRole,
  searchFilter,
  certificationAuthorityId,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
  searchFilter?: string;
  certificationAuthorityId?: string;
}) => {
  const feasibilityCountByCategory: Record<FeasibilityStatusFilter, number> = {
    ALL: 0,
    PENDING: 0,
    ADMISSIBLE: 0,
    REJECTED: 0,
    INCOMPLETE: 0,
    ARCHIVED: 0,
    DROPPED_OUT: 0,
    DRAFT: 0,
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

  let certificationAuthorityAccount: Account | null;

  if (hasRole("admin") && certificationAuthorityId) {
    certificationAuthorityAccount = await prismaClient.account.findFirst({
      where: { certificationAuthorityId },
    });
  }

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
                    },
                  ),
                };
              } else if (hasRole("admin") && certificationAuthorityAccount) {
                whereClause = {
                  ...whereClause,
                  ...getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole(
                    {
                      account: certificationAuthorityAccount,
                      isCertificationAuthorityLocalAccount: false,
                      certificationAuthorityLocalAccount: null,
                    },
                  ),
                };
              }

              let candidacyClause: Prisma.CandidacyWhereInput =
                whereClause?.candidacy || {};

              candidacyClause = {
                ...candidacyClause,
                ...getWhereClauseFromStatusFilter(statusFilter).candidacy,
                ...getWhereClauseFromSearchFilter(
                  candidacySearchWord,
                  searchFilter,
                ),
              };

              whereClause = {
                ...whereClause,
                ...getWhereClauseFromStatusFilter(statusFilter),
                candidacy: candidacyClause,
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
      },
    ),
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
}): Prisma.FeasibilityWhereInput => {
  let queryWhereClause = {};
  // For certification authority local accounts we restric matches to the local account own departments and certifications
  if (isCertificationAuthorityLocalAccount) {
    if (!certificationAuthorityLocalAccount) {
      throw new Error(
        "Compte local de l'autorité de certification non trouvée",
      );
    }

    const departmentIds =
      certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnDepartment.map(
        (calad) => calad.departmentId,
      );
    const certificationIds =
      certificationAuthorityLocalAccount?.certificationAuthorityLocalAccountOnCertification.map(
        (calac) => calac.certificationId,
      );

    queryWhereClause = {
      ...queryWhereClause,
      certificationAuthorityId:
        certificationAuthorityLocalAccount?.certificationAuthorityId,
      candidacy: {
        departmentId: { in: departmentIds },
        certificationId: { in: certificationIds },
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
  categoryFilter,
  searchFilter,
  certificationAuthorityId,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
  limit?: number;
  offset?: number;
  categoryFilter?: FeasibilityCategoryFilter;
  searchFilter?: string;
  certificationAuthorityId?: string;
}): Promise<PaginatedListResult<Feasibility>> => {
  let queryWhereClause: Prisma.FeasibilityWhereInput = { isActive: true };

  switch (categoryFilter) {
    case undefined:
    case "ALL":
      queryWhereClause = {
        ...queryWhereClause,
        ...excludeRejectedArchivedDraftAndDroppedOutCandidacy,
      };
      break;
    case "ARCHIVED":
      queryWhereClause = {
        ...queryWhereClause,
        candidacy: {
          candidacyStatuses: { some: { isActive: true, status: "ARCHIVE" } },
        },
      };
      break;
    case "DROPPED_OUT":
      queryWhereClause = {
        ...queryWhereClause,
        candidacy: { candidacyDropOut: { isNot: null } },
      };
      break;
    default:
      queryWhereClause = {
        ...queryWhereClause,
        ...excludeArchivedAndDroppedOutCandidacy,
        decision: categoryFilter as FeasibilityStatus,
      };
      break;
  }

  //only list feasibilties linked to the account certification authority
  if (hasRole("manage_feasibility")) {
    const account = await prismaClient.account.findFirstOrThrow({
      where: { keycloakId },
    });

    const isCertificationAuthorityLocalAccount = !hasRole(
      "manage_certification_authority_local_account",
    );

    const certificationAuthorityLocalAccount =
      isCertificationAuthorityLocalAccount
        ? await getCertificationAuthorityLocalAccountByAccountId({
            accountId: account.id,
          })
        : null;

    const candidacyWhereClause = {
      ...queryWhereClause?.candidacy,
      ...getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole({
        account,
        isCertificationAuthorityLocalAccount,
        certificationAuthorityLocalAccount,
      }).candidacy,
    };

    queryWhereClause = {
      ...queryWhereClause,
      ...getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole({
        account,
        isCertificationAuthorityLocalAccount,
        certificationAuthorityLocalAccount,
      }),
      candidacy: candidacyWhereClause,
    };
  } else if (hasRole("admin") && certificationAuthorityId) {
    //admin has access to everything
    const account = await prismaClient.account.findFirst({
      where: { certificationAuthorityId },
    });
    if (account) {
      const candidacyWhereClause = {
        ...queryWhereClause?.candidacy,
        ...getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole({
          account,
          isCertificationAuthorityLocalAccount: false,
          certificationAuthorityLocalAccount: null,
        }).candidacy,
      };

      queryWhereClause = {
        ...queryWhereClause,
        ...getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole({
          account,
          isCertificationAuthorityLocalAccount: false,
          certificationAuthorityLocalAccount: null,
        }),
        candidacy: candidacyWhereClause,
      };
    }
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
        ...getWhereClauseFromSearchFilter(candidacySearchWord, searchFilter),
      },
    };
  }

  const rows = await prismaClient.feasibility.findMany({
    where: queryWhereClause,
    skip: offset,
    take: limit,
    orderBy: [{ feasibilityFileSentAt: "desc" }],
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

  if (!feasibility) {
    throw new Error("Ce dossier est introuvable");
  }

  const authorized = await canManageFeasibility({
    hasRole,
    feasibility,
    keycloakId,
  });

  if (hasRole("admin") || authorized) {
    return { ...feasibility };
  } else {
    throw new Error("Vous n'êtes pas autorisé à consulter ce dossier");
  }
};

const deleteFeasibilityIDFile = async (feasibilityId: string) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: { id: feasibilityId },
    include: {
      feasibilityUploadedPdf: true,
    },
  });

  if (feasibility?.feasibilityUploadedPdf?.IDFileId) {
    await prismaClient.file.delete({
      where: {
        id: feasibility.feasibilityUploadedPdf?.IDFileId,
      },
    });

    const file = await prismaClient.file.findUnique({
      where: {
        id: feasibility.feasibilityUploadedPdf.IDFileId,
      },
    });

    if (file) {
      await deleteFile(file.path);
    }
  }
};

const validateFeasibility = async ({
  feasibilityId,
  comment,
  hasRole,
  keycloakId,
  userEmail,
  userRoles,
  infoFile,
}: {
  feasibilityId: string;
  comment?: string;
  hasRole: (role: string) => boolean;
  keycloakId: string;
  userEmail: string;
  userRoles: KeyCloakUserRole[];
  infoFile?: UploadedFile;
}) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: { id: feasibilityId },
  });

  if (!feasibility) {
    throw new Error("Dossier de faisabilité introuvable");
  }

  const authorized = await canManageFeasibility({
    hasRole,
    feasibility,
    keycloakId,
  });

  if (hasRole("admin") || authorized) {
    let infoFileInstance: S3File | undefined;
    if (infoFile) {
      infoFileInstance = {
        filePath: `candidacies/${feasibility.candidacyId}/feasibility/${v4()}`,
        data: infoFile._buf,
        mimeType: infoFile.mimetype,
      };

      await uploadFileToS3(infoFileInstance);
    }

    const updatedFeasibility = await prismaClient.feasibility.update({
      where: { id: feasibilityId },
      data: {
        decision: "ADMISSIBLE",
        decisionComment: comment,
        decisionSentAt: new Date(),
        decisionFile:
          infoFile && infoFileInstance
            ? {
                create: {
                  mimeType: infoFile.mimetype,
                  name: infoFile.filename,
                  path: infoFileInstance?.filePath,
                },
              }
            : undefined,
      },
      include: {
        candidacy: {
          include: {
            certification: {
              select: { label: true },
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

    const isAutonome =
      updatedFeasibility.candidacy.typeAccompagnement === "AUTONOME";
    if (isAutonome) {
      sendFeasibilityValidatedToCandidateAutonomeEmail({
        email: updatedFeasibility.candidacy.candidate?.email as string,
        certifName:
          updatedFeasibility.candidacy.certification?.label ||
          "Certification inconnue",
        comment,
        certificationAuthorityLabel:
          updatedFeasibility.certificationAuthority?.label ||
          "certificateur inconnu",
        infoFile,
      });
    } else {
      sendFeasibilityValidatedToCandidateAccompagneEmail({
        email: updatedFeasibility.candidacy.candidate?.email as string,
        certifName:
          updatedFeasibility.candidacy.certification?.label ||
          "Certification inconnue",
        comment,
        certificationAuthorityLabel:
          updatedFeasibility.certificationAuthority?.label ||
          "certificateur inconnu",
        infoFile,
      });

      if (updatedFeasibility.candidacy.organism?.contactAdministrativeEmail) {
        sendFeasibilityDecisionTakenToAAPEmail({
          email:
            updatedFeasibility.candidacy.organism?.contactAdministrativeEmail,
          feasibilityUrl: `${baseUrl}/admin2/candidacies/${updatedFeasibility.candidacyId}/feasibility-aap/pdf`,
        });
      }
    }

    // Delete ID File from feasibility
    await deleteFeasibilityIDFile(feasibilityId);

    await logCandidacyAuditEvent({
      candidacyId: feasibility.candidacyId,
      userKeycloakId: keycloakId,
      userEmail,
      userRoles,
      eventType: "FEASIBILITY_VALIDATED",
    });
    return updatedFeasibility;
  } else {
    throw new Error("Utilisateur non autorisé");
  }
};

const rejectFeasibility = async ({
  feasibilityId,
  comment,
  hasRole,
  keycloakId,
  userEmail,
  userRoles,
  infoFile,
}: {
  feasibilityId: string;
  comment?: string;
  hasRole: (role: string) => boolean;
  keycloakId: string;
  userEmail: string;
  userRoles: KeyCloakUserRole[];
  infoFile?: UploadedFile;
}) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: { id: feasibilityId },
  });

  if (!feasibility) {
    throw new Error("Dossier de faisabilité introuvable");
  }

  const authorized = await canManageFeasibility({
    hasRole,
    feasibility,
    keycloakId,
  });

  if (hasRole("admin") || authorized) {
    let infoFileInstance: S3File | undefined;
    if (infoFile) {
      infoFileInstance = {
        filePath: `candidacies/${feasibility.candidacyId}/feasibility/${v4()}`,
        data: infoFile._buf,
        mimeType: infoFile.mimetype,
      };

      await uploadFileToS3(infoFileInstance);
    }

    const updatedFeasibility = await prismaClient.feasibility.update({
      where: { id: feasibilityId },
      data: {
        decision: "REJECTED",
        decisionComment: comment,
        decisionSentAt: new Date(),
        decisionFile:
          infoFile && infoFileInstance
            ? {
                create: {
                  mimeType: infoFile.mimetype,
                  name: infoFile.filename,
                  path: infoFileInstance.filePath,
                },
              }
            : undefined,
      },
      include: {
        candidacy: {
          include: {
            candidate: {
              select: { email: true },
            },
            organism: { select: { contactAdministrativeEmail: true } },
            certification: { select: { label: true } },
          },
        },
        certificationAuthority: true,
      },
    });

    await updateCandidacyStatus({
      candidacyId: feasibility.candidacyId,
      status: "DOSSIER_FAISABILITE_NON_RECEVABLE",
    });

    const isAutonome =
      updatedFeasibility.candidacy.typeAccompagnement === "AUTONOME";
    const certificationName =
      updatedFeasibility.candidacy.certification?.label ||
      "certification inconnue";
    const certificationAuthorityLabel =
      updatedFeasibility.certificationAuthority?.label ||
      "certificateur inconnu";
    if (isAutonome) {
      sendFeasibilityRejectedToCandidateAutonomeEmail({
        email: updatedFeasibility.candidacy.candidate?.email as string,
        comment,
        certificationAuthorityLabel,
        certificationName,
        infoFile,
      });
    } else {
      sendFeasibilityRejectedToCandidateAccompagneEmail({
        email: updatedFeasibility.candidacy.candidate?.email as string,
        comment,
        certificationAuthorityLabel,
        infoFile,
      });

      if (updatedFeasibility.candidacy.organism?.contactAdministrativeEmail) {
        sendFeasibilityDecisionTakenToAAPEmail({
          email:
            updatedFeasibility.candidacy.organism?.contactAdministrativeEmail,
          feasibilityUrl: `${baseUrl}/admin2/candidacies/${updatedFeasibility.candidacy.id}/feasibility-aap/pdf`,
        });
      }
    }

    // Delete ID File from feasibility
    await deleteFeasibilityIDFile(feasibilityId);
    await logCandidacyAuditEvent({
      candidacyId: feasibility.candidacyId,
      userKeycloakId: keycloakId,
      userEmail,
      userRoles,
      eventType: "FEASIBILITY_REJECTED",
    });

    return updatedFeasibility;
  } else {
    throw new Error("Utilisateur non autorisé");
  }
};

const markFeasibilityAsIncomplete = async ({
  feasibilityId,
  comment,
  hasRole,
  keycloakId,
  userEmail,
  userRoles,
}: {
  feasibilityId: string;
  comment?: string;
  hasRole: (role: string) => boolean;
  keycloakId: string;
  userEmail: string;
  userRoles: KeyCloakUserRole[];
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
        feasibilityUrl: `${baseUrl}/admin2/candidacies/${updatedFeasibility.candidacy.id}/feasibility-aap/pdf`,
        comment,
      });
    }

    // Delete ID File from feasibility
    await deleteFeasibilityIDFile(feasibilityId);

    await logCandidacyAuditEvent({
      candidacyId: feasibility?.candidacyId,
      userKeycloakId: keycloakId,
      userEmail,
      userRoles,
      eventType: "FEASIBILITY_MARKED_AS_INCOMPLETE",
    });

    return updatedFeasibility;
  } else {
    throw new Error("Utilisateur non autorisé");
  }
};

export const canDownloadFeasibilityFiles = async ({
  hasRole,
  feasibility,
  candidacyId,
  keycloakId,
}: {
  hasRole(role: string): boolean;
  feasibility: Feasibility | null;
  candidacyId: string;
  keycloakId: string;
}) => {
  return (
    (await canUserManageCandidacy({
      hasRole,
      candidacyId,
      keycloakId,
    })) ||
    (await canManageFeasibility({ hasRole, feasibility, keycloakId })) ||
    (await isCandidacyOwner(keycloakId, candidacyId))
  );
};

const isCandidacyOwner = async (
  keycloakId: string,
  candidacyId: string,
): Promise<boolean> => {
  const candidate = await prismaClient.candidate.findFirst({
    where: { keycloakId },
  });
  if (!candidate) {
    return false;
  }

  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });
  if (candidacy?.candidateId != candidate.id) {
    return false;
  }

  return true;
};

const canManageFeasibility = async ({
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
          "Compte local de l'autorité de certification non trouvé",
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
          (calad) => calad.departmentId,
        );

      return !!(await prismaClient.feasibility.findFirst({
        where: {
          id: feasibility.id,
          certificationAuthorityId:
            certificationAuthorityLocalAccount.certificationAuthorityId,
          candidacy: {
            departmentId: { in: departmentIds },
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
  userEmail: string;
  userRoles: KeyCloakUserRole[];
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
        `La décision ${decision} est invalide pour le dossier de faisabilité`,
      );
  }
};
