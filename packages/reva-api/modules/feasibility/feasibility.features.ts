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
  sendFeasibilityDecisionTakenToAAPEmail,
  sendFeasibilityIncompleteMailToAAP,
  sendFeasibilityRejectedCandidateEmail,
  sendFeasibilityValidatedCandidateEmail,
  sendNewFeasibilitySubmittedEmail,
} from "./feasibility.mails";

const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";

export interface UploadedFile {
  data: Buffer;
  filename: string;
  mimetype: string;
}

export const getCertificationAuthority = ({
  certificationId,
  departmentId,
}: {
  certificationId: string;
  departmentId: string;
}) =>
  certificationId && departmentId
    ? prismaClient.certificationAuthority.findFirst({
        where: {
          certificationAuthorityOnDepartment: { some: { departmentId } },
          certificationAuthorityOnCertification: {
            some: { certificationId },
          },
        },
      })
    : null;

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
    : null;

export const createFeasibility = async ({
  candidacyId,
  certificationAuthorityId,
  feasibilityFile,
  documentaryProofFile,
  certificateOfAttendanceFile,
}: {
  candidacyId: string;
  certificationAuthorityId: string;
  feasibilityFile: UploadedFile;
  documentaryProofFile?: UploadedFile;
  certificateOfAttendanceFile?: UploadedFile;
}) => {
  const feasibility = await prismaClient.feasibility.create({
    data: {
      candidacy: { connect: { id: candidacyId } },
      certificationAuthority: { connect: { id: certificationAuthorityId } },
      feasibilityFileSentAt: new Date(),
      feasibilityFile: {
        create: {
          content: feasibilityFile.data,
          mimeType: feasibilityFile.mimetype,
          name: feasibilityFile.filename,
        },
      },
      documentaryProofFile: documentaryProofFile
        ? {
            create: {
              content: documentaryProofFile.data,
              mimeType: documentaryProofFile.mimetype,
              name: documentaryProofFile.filename,
            },
          }
        : undefined,
      certificateOfAttendanceFile: certificateOfAttendanceFile
        ? {
            create: {
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
  };

  const countQuery = (decision?: FeasibilityStatus) => {
    let commonWhereClause = "1=1";
    let commonJoinClause = "";

    if (hasRole("admin")) {
      commonWhereClause = "1=1";
    } else if (hasRole("manage_feasibility")) {
      commonJoinClause = `join candidacy on candidacy.id=feasibility.candidacy_id join candidacy_region_certification on (candidacy_region_certification.is_active = true and candidacy_region_certification.candidacy_id = candidacy.id) join account on account.keycloak_id='${keycloakId}' join certification_authority on certification_authority.id = account.certification_authority_id`;

      //restriction on certifications handled by certification authority
      commonWhereClause = `${commonWhereClause} and candidacy_region_certification.certification_id in (select certification_authority_on_certification.certification_id from certification_authority_on_certification where certification_authority_on_certification.certification_authority_id=certification_authority.id)`;

      //restriction on departments handled by certification authority
      commonWhereClause = `${commonWhereClause} and candidacy_region_certification.region_id in (select department.region_id from department where department.id in (select certification_authority_on_department.department_id from certification_authority_on_department where certification_authority_on_department.certification_authority_id=certification_authority.id))`;
    } else {
      throw new Error("Utilisateur non autorisé");
    }

    return decision
      ? `select '${decision.toString()}' as decision, count (decision) from feasibility ${commonJoinClause} where ${commonWhereClause} and feasibility.decision = '${decision}' group by decision`
      : `select 'ALL' as decision, count (decision) from feasibility ${commonJoinClause} where ${commonWhereClause} and feasibility.is_active = 'true'`;
  };

  const query = `${countQuery()} 
  UNION ${countQuery("PENDING")} 
  UNION ${countQuery("ADMISSIBLE")} 
  UNION ${countQuery("REJECTED")}`;

  type DecisionWithoutIncomplete = //can't use Omit here since it loses information and mess up the array indexing bellow
    "ALL" | "PENDING" | "REJECTED" | "ADMISSIBLE";

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
    ? { decision, isActive: true }
    : { isActive: true };

  //only list feasibilties attached to candidacies that have both certification and department covered by the certification authority linked to the user account
  if (hasRole("manage_feasibility")) {
    const account = await prismaClient.account.findFirst({
      where: { keycloakId },
      include: {
        certificationAuthority: {
          include: {
            certificationAuthorityOnDepartment: true,
            certificationAuthorityOnCertification: true,
          },
        },
      },
    });

    const accountDepartmentIdList =
      account?.certificationAuthority?.certificationAuthorityOnDepartment?.map(
        (c) => c.departmentId
      ) || [];

    const accountCertificationIdList =
      account?.certificationAuthority?.certificationAuthorityOnCertification?.map(
        (c) => c.certificationId
      ) || [];

    queryWhereClause = {
      ...queryWhereClause,
      candidacy: {
        certificationsAndRegions: {
          some: {
            isActive: true,
            certificationId: { in: accountCertificationIdList },
            region: {
              departments: {
                some: { id: { in: accountDepartmentIdList } },
              },
            },
          },
        },
      },
    };

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
  } else if (!hasRole("admin")) {
    //admin has access to everything
    throw new Error("Utilisateur non autorisé");
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

export const getCandidacyById = async ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<Candidacy> => {
  const result = await getCandidacyFromId(candidacyId);
  if (result.isLeft()) {
    throw new Error(result.leftOrDefault("Erreur inattendue"));
  } else {
    return result.extract() as Candidacy;
  }
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

    const certificationAuthorities =
      updatedFeasibility.certificationAuthority ??
      (await getCertificationAuthority({
        certificationId: activeCertificationAndRegion.certificationId,
        departmentId: updatedFeasibility.candidacy.departmentId || "",
      }));

    sendFeasibilityValidatedCandidateEmail({
      email: updatedFeasibility.candidacy.candidate?.email as string,
      certifName: activeCertificationAndRegion.certification.label,
      comment,
      certificationAuthorityLabel:
        certificationAuthorities?.label || "certificateur inconnu",
      infoFile,
    });
    if (updatedFeasibility.candidacy.organism?.contactAdministrativeEmail) {
      sendFeasibilityDecisionTakenToAAPEmail({
        email:
          updatedFeasibility.candidacy.organism?.contactAdministrativeEmail,
        feasibilityUrl: `${baseUrl}/admin/candidacies/${updatedFeasibility.candidacyId}/feasibility`,
      });
    }
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
            certificationsAndRegions: {
              where: { isActive: true },
            },
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

    const activeCertificationAndRegion =
      updatedFeasibility.candidacy.certificationsAndRegions[0];

    const certificationAuthority =
      updatedFeasibility.certificationAuthority ??
      (await getCertificationAuthority({
        certificationId: activeCertificationAndRegion.certificationId,
        departmentId: updatedFeasibility.candidacy.departmentId || "",
      }));

    sendFeasibilityRejectedCandidateEmail({
      email: updatedFeasibility.candidacy.candidate?.email as string,
      comment,
      certificationAuthorityLabel:
        certificationAuthority?.label || "certificateur inconnu",
      infoFile,
    });
    if (updatedFeasibility.candidacy.organism?.contactAdministrativeEmail) {
      sendFeasibilityDecisionTakenToAAPEmail({
        email:
          updatedFeasibility.candidacy.organism?.contactAdministrativeEmail,
        feasibilityUrl: `${baseUrl}/admin/candidacies/${updatedFeasibility.candidacy.id}/feasibility`,
      });
    }
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
      });
    }
    return updatedFeasibility;
  } else {
    throw new Error("Utilisateur non autorisé");
  }
};

export const canDownloadFeasibilityFiles = async ({
  hasRole,
  candidacyId,
  keycloakId,
}: {
  hasRole(role: string): boolean;
  candidacyId: string;
  keycloakId: string;
}) => {
  const userCanManageCandidacy = canUserManageCandidacy;

  return (
    userCanManageCandidacy ||
    canManageFeasibilityWithCandidacyId({ hasRole, candidacyId, keycloakId })
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

  return await canManageFeasibilityWithCandidacyId({
    hasRole,
    candidacyId: feasibility.candidacyId,
    keycloakId,
  });
};

export const canManageFeasibilityWithCandidacyId = async ({
  hasRole,
  candidacyId,
  keycloakId,
}: {
  hasRole(role: string): boolean;
  candidacyId: string;
  keycloakId: string;
}) => {
  //admins can manage everything
  if (hasRole("admin")) {
    return true;
  } else if (hasRole("manage_feasibility")) {
    const candidacy = await getCandidacyById({ candidacyId });

    const candidacyDepartementsIds = (
      await prismaClient.department.findMany({
        where: { regionId: candidacy.regionId },
      })
    ).map((d) => d.id);

    //is user account attached to a certification authority which manage the candidacy certification ?
    const result = await prismaClient.account.findFirst({
      where: {
        keycloakId,
        certificationAuthority: {
          certificationAuthorityOnCertification: {
            some: { certificationId: candidacy.certificationId },
          },
          certificationAuthorityOnDepartment: {
            some: { departmentId: { in: candidacyDepartementsIds } },
          },
        },
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
