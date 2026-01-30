import { prismaClient } from "@/prisma/client";
import { attachOrganismToAllConventionCollectiveHelper } from "@/test/helpers/attach-organism-to-all-ccn-helper";
import { attachOrganismToAllDegreesHelper } from "@/test/helpers/attach-organism-to-all-degrees-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";

import { isOrganismAttachedToCertifications } from "./isOrganismAttachedToCertifications";

test("should return true when an organism is attached to the certification", async () => {
  const certification = await createCertificationHelper();
  const ccn = await prismaClient.conventionCollective.findFirst();
  if (!certification || !ccn) {
    throw new Error("Certification or CCN not found");
  }
  await prismaClient.certificationOnConventionCollective.create({
    data: {
      certificationId: certification.id,
      ccnId: ccn.id,
    },
  });

  const organism = await createOrganismHelper({
    modaliteAccompagnement: "LIEU_ACCUEIL",
  });

  await attachOrganismToAllDegreesHelper(organism);
  await attachOrganismToAllConventionCollectiveHelper(organism);

  const result = await isOrganismAttachedToCertifications({
    organismId: organism.id,
    certificationIds: [certification.id],
  });
  expect(result).toBe(true);
});

test("should return false when an organism is not attached to the certification", async () => {
  const certification = await createCertificationHelper();
  const ccn = await prismaClient.conventionCollective.findFirst();
  if (!certification || !ccn) {
    throw new Error("Certification or CCN not found");
  }
  await prismaClient.certificationOnConventionCollective.create({
    data: {
      certificationId: certification.id,
      ccnId: ccn.id,
    },
  });

  const organism = await createOrganismHelper({
    modaliteAccompagnement: "LIEU_ACCUEIL",
  });

  const result = await isOrganismAttachedToCertifications({
    organismId: organism.id,
    certificationIds: [certification.id],
  });
  expect(result).toBe(false);
});

test("should return true when an organism is attached to two certifications", async () => {
  const certification = await createCertificationHelper();
  const ccn = await prismaClient.conventionCollective.findFirst();
  if (!certification || !ccn) {
    throw new Error("Certification or CCN not found");
  }
  await prismaClient.certificationOnConventionCollective.create({
    data: {
      certificationId: certification.id,
      ccnId: ccn.id,
    },
  });

  const certification2 = await createCertificationHelper();

  await prismaClient.certificationOnConventionCollective.create({
    data: {
      certificationId: certification2.id,
      ccnId: ccn.id,
    },
  });

  const organism = await createOrganismHelper({
    modaliteAccompagnement: "LIEU_ACCUEIL",
  });

  await attachOrganismToAllDegreesHelper(organism);
  await attachOrganismToAllConventionCollectiveHelper(organism);

  const result = await isOrganismAttachedToCertifications({
    organismId: organism.id,
    certificationIds: [certification.id, certification2.id],
  });
  expect(result).toBe(true);
});

test("should return false when an organism is attached to one certification but not the other", async () => {
  const certification = await createCertificationHelper();
  const ccn = await prismaClient.conventionCollective.findFirst();
  if (!certification || !ccn) {
    throw new Error("Certification or CCN not found");
  }
  await prismaClient.certificationOnConventionCollective.create({
    data: {
      certificationId: certification.id,
      ccnId: ccn.id,
    },
  });

  const certification2 = await createCertificationHelper();

  const organism = await createOrganismHelper({
    modaliteAccompagnement: "LIEU_ACCUEIL",
  });

  await attachOrganismToAllDegreesHelper(organism);
  await attachOrganismToAllConventionCollectiveHelper(organism);

  const result = await isOrganismAttachedToCertifications({
    organismId: organism.id,
    certificationIds: [certification.id, certification2.id],
  });
  expect(result).toBe(false);
});
