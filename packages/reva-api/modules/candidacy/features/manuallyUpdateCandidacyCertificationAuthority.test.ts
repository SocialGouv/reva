import { CandidacyStatusStep } from "@prisma/client";

import { CandidacyAuditLogUserInfo } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";

import { manuallyUpdateCandidacyCertificationAuthority } from "./manuallyUpdateCandidacyCertificationAuthority";

describe("manuallyUpdateCandidacyCertificationAuthority", () => {
  const buildUserInfo = async (): Promise<CandidacyAuditLogUserInfo> => {
    const account = await createAccountHelper();
    return {
      userKeycloakId: account.keycloakId,
      userEmail: account.email,
      userRoles: ["admin"],
    };
  };

  test("should throw when certification authority does not exist", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: "PARCOURS_CONFIRME",
    });
    const userInfo = await buildUserInfo();

    await expect(
      manuallyUpdateCandidacyCertificationAuthority({
        candidacyId: candidacy.id,
        certificationAuthorityId: "00000000-0000-0000-0000-000000000000",
        userInfo,
      }),
    ).rejects.toThrow("Certificateur non trouvé");

    const logs = await prismaClient.candidacyLog.findMany({
      where: { candidacyId: candidacy.id },
    });
    expect(logs).toHaveLength(0);
  });

  test("should update the candidacy certification authority and log the audit event", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: "PARCOURS_CONFIRME",
    });
    const certificationAuthority = await createCertificationAuthorityHelper();
    const userInfo = await buildUserInfo();

    const result = await manuallyUpdateCandidacyCertificationAuthority({
      candidacyId: candidacy.id,
      certificationAuthorityId: certificationAuthority.id,
      userInfo,
    });

    expect(result.certificationAuthorityId).toEqual(certificationAuthority.id);

    const updatedCandidacy = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });
    expect(updatedCandidacy?.certificationAuthorityId).toEqual(
      certificationAuthority.id,
    );

    const logs = await prismaClient.candidacyLog.findMany({
      where: { candidacyId: candidacy.id },
    });
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      eventType: "CANDIDACY_CERTIFICATION_AUTHORITY_UPDATED",
      userKeycloakId: userInfo.userKeycloakId,
      userEmail: userInfo.userEmail,
      details: {
        certificationAuthorityId: certificationAuthority.id,
        certificationAuthorityLabel: certificationAuthority.label,
      },
    });
  });

  test("should rollback and not log when the candidacy status does not allow the change", async () => {
    const blockedStatus: CandidacyStatusStep = "ARCHIVE";
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: blockedStatus,
    });
    const certificationAuthority = await createCertificationAuthorityHelper();
    const userInfo = await buildUserInfo();

    await expect(
      manuallyUpdateCandidacyCertificationAuthority({
        candidacyId: candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        userInfo,
      }),
    ).rejects.toThrow(
      "Le statut de la candidature ne permet pas de changer de certificateur",
    );

    const updatedCandidacy = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });
    expect(updatedCandidacy?.certificationAuthorityId).toBeNull();

    const logs = await prismaClient.candidacyLog.findMany({
      where: { candidacyId: candidacy.id },
    });
    expect(logs).toHaveLength(0);
  });

  test("should rollback when the candidacy does not exist", async () => {
    const certificationAuthority = await createCertificationAuthorityHelper();
    const userInfo = await buildUserInfo();
    const candidacyId = "00000000-0000-0000-0000-000000000000";

    await expect(
      manuallyUpdateCandidacyCertificationAuthority({
        candidacyId,
        certificationAuthorityId: certificationAuthority.id,
        userInfo,
      }),
    ).rejects.toThrow();

    const logs = await prismaClient.candidacyLog.findMany({
      where: { candidacyId },
    });
    expect(logs).toHaveLength(0);
  });
});
