import { prismaClient } from "@/prisma/client";
import { createCandidacyDropOutHelper } from "@/test/helpers/entities/create-candidacy-drop-out-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createDropOutReasonHelper } from "@/test/helpers/entities/create-drop-out-reason-helper";

import { dropOutCandidacies } from "./dropOutCandidacies";

describe("drop out candidacies", () => {
  test("should throw an error for non-existent candidacies", async () => {
    const dropoutReason = await createDropOutReasonHelper();

    await expect(async () => {
      await dropOutCandidacies({
        candidacyIds: ["wr0ng1d", "anoth3r_wr0ng1d"],
        dropOutReasonId: dropoutReason.id,
      });
    }).rejects.toThrow();
  });

  test("should skip candidacies that are already dropped out and return only processed ones", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    const candidacy1 = await createCandidacyHelper();
    const candidacyDropOut = await createCandidacyDropOutHelper();

    // Should process only the valid candidacy and return its ID
    const result = await dropOutCandidacies({
      candidacyIds: [candidacy1.id, candidacyDropOut.candidacy.id],
      dropOutReasonId: dropoutReason.id,
    });

    expect(result).toEqual([candidacy1.id]);

    // Check that candidacy1 was dropped out
    const candidacy1DropOut = await prismaClient.candidacyDropOut.findUnique({
      where: {
        candidacyId: candidacy1.id,
      },
    });

    expect(candidacy1DropOut).not.toBeNull();
    expect(candidacy1DropOut?.dropOutReasonId).toEqual(dropoutReason.id);
  });

  test("should attempt to create drop out with any reason ID (no validation)", async () => {
    const candidacy = await createCandidacyHelper();

    // The function no longer validates the drop out reason, so it will try to create
    // This will likely fail at the database level due to foreign key constraints
    await expect(async () => {
      await dropOutCandidacies({
        candidacyIds: [candidacy.id],
        dropOutReasonId: "wr0ng1d",
      });
    }).rejects.toThrow(); // Will throw due to database constraint, not validation
  });

  test("should successfully drop out single candidacy and return its ID", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    const candidacy = await createCandidacyHelper();

    const result = await dropOutCandidacies({
      candidacyIds: [candidacy.id],
      dropOutReasonId: dropoutReason.id,
    });

    expect(result).toEqual([candidacy.id]);

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
    expect(candidacyDropOut?.status).toEqual(candidacy.status);
    expect(candidacyDropOut?.otherReasonContent).toBeNull();
  });

  test("should successfully drop out multiple candidacies and return all IDs", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    const candidacy1 = await createCandidacyHelper();
    const candidacy2 = await createCandidacyHelper();
    const candidacy3 = await createCandidacyHelper();

    const result = await dropOutCandidacies({
      candidacyIds: [candidacy1.id, candidacy2.id, candidacy3.id],
      dropOutReasonId: dropoutReason.id,
    });

    expect(result).toEqual(
      expect.arrayContaining([candidacy1.id, candidacy2.id, candidacy3.id]),
    );
    expect(result).toHaveLength(3);

    // Check that all candidacies were dropped out
    const candidacyDropOuts = await prismaClient.candidacyDropOut.findMany({
      where: {
        candidacyId: { in: [candidacy1.id, candidacy2.id, candidacy3.id] },
      },
      include: {
        dropOutReason: true,
      },
    });

    expect(candidacyDropOuts).toHaveLength(3);
    candidacyDropOuts.forEach((dropOut) => {
      expect(dropOut.dropOutReason.id).toEqual(dropoutReason.id);
      expect(dropOut.otherReasonContent).toBeNull();
    });
  });

  test("should successfully drop out candidacy with other reason content and return ID", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    const candidacy = await createCandidacyHelper();
    const otherReasonContent = "Custom reason for dropping out";

    const result = await dropOutCandidacies({
      candidacyIds: [candidacy.id],
      dropOutReasonId: dropoutReason.id,
      otherReasonContent,
    });

    expect(result).toEqual([candidacy.id]);

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
    expect(candidacyDropOut?.otherReasonContent).toEqual(otherReasonContent);
  });

  test("should return empty array when empty candidacy IDs array is provided", async () => {
    const dropoutReason = await createDropOutReasonHelper();

    const result = await dropOutCandidacies({
      candidacyIds: [],
      dropOutReasonId: dropoutReason.id,
    });

    expect(result).toEqual([]);
  });

  test("should return empty array when no dropOutReasonId is provided", async () => {
    const candidacy = await createCandidacyHelper();

    const result = await dropOutCandidacies({
      candidacyIds: [candidacy.id],
      dropOutReasonId: "",
    });

    expect(result).toEqual([]);
  });

  test("should preserve candidacy status when dropping out and return ID", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: "DOSSIER_FAISABILITE_ENVOYE",
    });

    const result = await dropOutCandidacies({
      candidacyIds: [candidacy.id],
      dropOutReasonId: dropoutReason.id,
    });

    expect(result).toEqual([candidacy.id]);

    const candidacyDropOut = await prismaClient.candidacyDropOut.findUnique({
      where: {
        candidacyId: candidacy.id,
      },
    });

    expect(candidacyDropOut?.status).toEqual("DOSSIER_FAISABILITE_ENVOYE");
  });
});
