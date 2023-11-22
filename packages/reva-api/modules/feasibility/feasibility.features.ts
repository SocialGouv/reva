import { Feasibility, FeasibilityStatus, Prisma } from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import { getAccountFromKeycloakId } from "../account/database/accounts";
import { Candidacy } from "../candidacy/candidacy.types";
import {
  getCandidaciesFromIds,
  getCandidacyFromId,
  updateCandidacyStatus,
} from "../candidacy/database/candidacies";
import { canManageCandidacy } from "../candidacy/features/canManageCandidacy";
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
          content: feasibilityFile.data,
          mimeType: feasibilityFile.mimetype,
          name: feasibilityFile.filename,
        },
      },
      IDFile: {
        create: {
          id: IDFileInstance.id,
          content: IDFile.data,
          mimeType: IDFile.mimetype,
          name: IDFile.filename,
        },
      },
      documentaryProofFile: documentaryProofFile
        ? {
            create: {
              id: documentaryProofFileInstance?.id,
              content: documentaryProofFile.data,
              mimeType: documentaryProofFile.mimetype,
              name: documentaryProofFile.filename,
            },
          }
        : undefined,
      certificateOfAttendanceFile: certificateOfAttendanceFile
        ? {
            create: {
              id: certificateOfAttendanceFileInstance?.id,
              content: certificateOfAttendanceFile.data,
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

export const getFileWithContent = async ({ fileId }: { fileId: string }) =>
  await prismaClient.file.findFirst({
    where: { id: fileId },
  });

export const getActiveFeasibilityCountByCategory = async ({
  keycloakId,
  hasRole,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
}) => {
  const feasibilityCountByCategory = {
    ALL: 0,
    PENDING: 0,
    ADMISSIBLE: 0,
    REJECTED: 0,
    INCOMPLETE: 0,
  };

  const countQueryHelper = ({
    decision,
    from,
    where,
  }: {
    decision?: string;
    from: string;
    where?: string;
  }) => {
    const select = decision ? `'${decision}' as decision` : "'ALL' as decision";

    const whereClauseAnd = where ? `${where} and` : "";

    return decision
      ? `select ${select}, count(decision)
            from ${from} 
            where ${whereClauseAnd} feasibility.decision = '${decision}' and feasibility.is_active = '${
          decision !== "INCOMPLETE"
        }'`
      : `select ${select}, count(decision)
            from ${from} 
            where ${whereClauseAnd} (feasibility.is_active = 'true' or (feasibility.is_active = 'false' and decision = 'INCOMPLETE'))`;
  };

  const countQuery = (decision?: FeasibilityStatus) => {
    if (hasRole("admin")) {
      return countQueryHelper({ decision, from: `feasibility` });
    } else if (hasRole("manage_feasibility")) {
      return countQueryHelper({
        decision,
        from: `account join feasibility on feasibility.certification_authority_id = account.certification_authority_id`,
        where: `account.keycloak_id = '${keycloakId}'`,
      });
    } else {
      throw new Error("Utilisateur non autorisé");
    }
  };

  const query = `${countQuery()} 
  UNION ${countQuery("PENDING")} 
  UNION ${countQuery("ADMISSIBLE")}
  UNION ${countQuery("INCOMPLETE")}
  UNION ${countQuery("REJECTED")}`;

  type DecisionWithoutIncomplete = //can't use Omit here since it loses information and mess up the array indexing bellow
    "ALL" | "PENDING" | "REJECTED" | "ADMISSIBLE" | "INCOMPLETE";

  const feasibilityCountByStatusFromDb: {
    decision: DecisionWithoutIncomplete;
    count: bigint;
  }[] = await prismaClient.$queryRawUnsafe(query);

  feasibilityCountByStatusFromDb.forEach((fcbs) => {
    feasibilityCountByCategory[fcbs.decision] = Number(fcbs.count);
  });

  return feasibilityCountByCategory;
};

const buildContainsFilterClause =
  (searchFilter: string) => (field: string) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

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
      where: { keycloakId, NOT: { certificationAuthorityId: null } },
    });

    queryWhereClause = {
      ...queryWhereClause,
      certificationAuthorityId: account.certificationAuthorityId || "_",
    };
  } else if (!hasRole("admin")) {
    //admin has access to everything
    throw new Error("Utilisateur non autorisé");
  }

  if (searchFilter && searchFilter.length > 0) {
    const containsFilter = buildContainsFilterClause(searchFilter);

    queryWhereClause = {
      ...queryWhereClause,
      candidacy: {
        ...(queryWhereClause.candidacy as Prisma.CandidacyWhereInput),
        OR: [
          {
            candidate: {
              OR: [
                containsFilter("lastname"),
                containsFilter("firstname"),
                containsFilter("firstname2"),
                containsFilter("firstname3"),
                containsFilter("email"),
                containsFilter("phone"),
              ],
            },
          },
          { organism: containsFilter("label") },
          { department: containsFilter("label") },
          {
            certificationsAndRegions: {
              some: {
                certification: containsFilter("label"),
              },
            },
          },
        ],
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
    //is user account attached to a certification authority which manage the candidacy certification ?
    const result = await prismaClient.account.findFirst({
      where: {
        keycloakId,
        certificationAuthorityId: feasibility.certificationAuthorityId,
      },
      select: { id: true },
    });

    return !!result;
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
}) => {
  return (
    await canManageCandidacy(
      {
        hasRole,
        getAccountFromKeycloakId,
        getCandidacyFromId,
      },
      {
        candidacyId,
        keycloakId,
      }
    )
  ).orDefault(false);
};

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
