import { CandidacyStatusStep } from "@prisma/client";

import { FunctionalCodeError } from "@/modules/shared/error/functionalError";
import { prismaClient } from "@/prisma/client";
import { createCandidacyDropOutHelper } from "@/test/helpers/entities/create-candidacy-drop-out-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createDropOutReasonHelper } from "@/test/helpers/entities/create-drop-out-reason-helper";

import { dropOutCandidacy } from "./dropOutCandidacy";

describe("drop out candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    await expect(async () => {
      await dropOutCandidacy({
        candidacyId: "wr0ng1d",
        dropOutReasonId: dropoutReason!.id,
        userRoles: ["manage_candidacy"],
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST);
  });
  test("should fail with CANDIDACY_ALREADY_DROPPED_OUT", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    const candidacyDropOut = await createCandidacyDropOutHelper();
    await expect(async () => {
      await dropOutCandidacy({
        candidacyId: candidacyDropOut.candidacy.id,
        dropOutReasonId: dropoutReason!.id,
        userRoles: ["manage_candidacy"],
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_ALREADY_DROPPED_OUT);
  });
  test("should fail with CANDIDACY_INVALID_DROP_OUT_REASON error code", async () => {
    const candidacy = await createCandidacyHelper();
    await expect(async () => {
      await dropOutCandidacy({
        candidacyId: candidacy.id,
        dropOutReasonId: "wr0ng1d",
        userRoles: ["manage_candidacy"],
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_INVALID_DROP_OUT_REASON);
  });

  test("should fail because the candidacy is not in the DOSSIER_FAISABILITE_ENVOYE status", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    const candidacy = await createCandidacyHelper();
    await expect(async () => {
      await dropOutCandidacy({
        candidacyId: candidacy.id,
        dropOutReasonId: dropoutReason.id,
        userRoles: ["manage_candidacy"],
      });
    }).rejects.toThrow(
      "La candidature ne peut être abandonnée car le dossier de faisabilité n'a pas été envoyé",
    );
  });

  test.each(["manage_candidacy", "admin"])(
    "should fail when feasibility file has been sent and decision pending (role: %s)",
    async (role: KeyCloakUserRole) => {
      const dropoutReason = await createDropOutReasonHelper();
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
      });

      await expect(async () => {
        await dropOutCandidacy({
          candidacyId: candidacy.id,
          dropOutReasonId: dropoutReason.id,
          userRoles: [role],
        });
      }).rejects.toThrow(
        `La candidature ${candidacy.id} ne peut pas être abandonnée car le dossier de faisabilité est envoyé et une décision du certificateur est en attente`,
      );
    },
  );

  test.each<CandidacyStatusStep>([
    "DOSSIER_FAISABILITE_INCOMPLET",
    "DOSSIER_FAISABILITE_COMPLET",
  ])(
    "should allow AAP to drop out candidacy at %s status",
    async (status: CandidacyStatusStep) => {
      const dropoutReason = await createDropOutReasonHelper();
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: status,
      });
      await dropOutCandidacy({
        candidacyId: candidacy.id,
        dropOutReasonId: dropoutReason.id,
        userRoles: ["manage_candidacy"],
      });
      const candidacyDropOut = await prismaClient.candidacyDropOut.findUnique({
        where: {
          candidacyId: candidacy.id,
        },
        include: {
          dropOutReason: true,
        },
      });
      expect(candidacyDropOut).not.toBeNull();
      expect(candidacyDropOut?.dropOutReason.id).toEqual(dropoutReason.id);
    },
  );
});
