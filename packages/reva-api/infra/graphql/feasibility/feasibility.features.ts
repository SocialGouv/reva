import { Feasibility, FeasibilityStatus } from "@prisma/client";

import { canManageCandidacy } from "../../../domain/features/canManageCandidacy";
import { Candidacy } from "../../../domain/types/candidacy";
import { processPaginationInfo } from "../../../domain/utils/pagination";
import { getAccountFromKeycloakId } from "../../database/postgres/accounts";
import * as candidacyDb from "../../database/postgres/candidacies";
import { getCandidacyFromId } from "../../database/postgres/candidacies";
import { prismaClient } from "../../database/postgres/client";
import { logger } from "../../logger";
import {
  sendFeasibilityDecisionTakenToAAPEmail,
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

export const createFeasibility = async ({
  candidacyId,
  feasibilityFile,
  documentaryProofFile,
  certificateOfAttendanceFile,
}: {
  candidacyId: string;
  feasibilityFile: UploadedFile;
  documentaryProofFile?: UploadedFile;
  certificateOfAttendanceFile?: UploadedFile;
}) => {
  const feasibility = await prismaClient.feasibility.create({
    data: {
      candidacy: { connect: { id: candidacyId } },
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
    const certificationAuthority = await getCertificationAuthority({
      certificationId:
        candidacy?.certificationsAndRegions?.[0]?.certificationId,
      departmentId: candidacy?.departmentId,
    });
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

export const getFeasibilityByCandidacyid = ({
  candidacyId,
}: {
  candidacyId: string;
}) => prismaClient.feasibility.findFirst({ where: { candidacyId } });

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

export const getFeasibilityCountByCategory = async ({
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
      : `select 'ALL' as decision, count (decision) from feasibility ${commonJoinClause} where ${commonWhereClause}`;
  };

  const query = `${countQuery()} 
  UNION ${countQuery("PENDING")} 
  UNION ${countQuery("ADMISSIBLE")} 
  UNION ${countQuery("REJECTED")}`;

  //logger.info({ query, keycloakId });
  const feasibilityCountByStatusFromDb: {
    decision: FeasibilityStatus;
    count: bigint;
  }[] = await prismaClient.$queryRawUnsafe(query);

  feasibilityCountByStatusFromDb.forEach((fcbs) => {
    feasibilityCountByCategory[fcbs.decision] = Number(fcbs.count);
  });

  return feasibilityCountByCategory;
};

export const getFeasibilities = async ({
  keycloakId,
  hasRole,
  limit = 10,
  offset = 0,
  decision,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
  limit?: number;
  offset?: number;
  decision?: FeasibilityStatus;
}): Promise<PaginatedListResult<Feasibility>> => {
  let queryWhereClause: object = decision ? { decision } : {};

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
  const result = await candidacyDb.getCandidacyFromId(candidacyId);
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
  return candidacyDb.getCandidaciesFromIds(candidacyIds);
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
      },
    });

    const activeCertificationAndRegion =
      updatedFeasibility.candidacy.certificationsAndRegions[0];

    const certificationAuthority = await getCertificationAuthority({
      certificationId: activeCertificationAndRegion.certificationId,
      departmentId: updatedFeasibility.candidacy.departmentId || "",
    });

    sendFeasibilityValidatedCandidateEmail({
      email: updatedFeasibility.candidacy.candidate?.email as string,
      certifName: activeCertificationAndRegion.certification.label,
      comment,
      certificationAuthorityLabel:
        certificationAuthority?.label || "certificateur inconnu",
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
      },
    });

    const activeCertificationAndRegion =
      updatedFeasibility.candidacy.certificationsAndRegions[0];

    const certificationAuthority = await getCertificationAuthority({
      certificationId: activeCertificationAndRegion.certificationId,
      departmentId: updatedFeasibility.candidacy.departmentId || "",
    });

    sendFeasibilityRejectedCandidateEmail({
      email: updatedFeasibility.candidacy.candidate?.email as string,
      comment,
      certificationAuthorityLabel:
        certificationAuthority?.label || "certificateur inconnu",
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
