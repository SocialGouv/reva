import { prismaClient } from "../prisma/client";

const DO_NOT_CLEAR_THESE_TABLES = [
  "_prisma_migrations",
  "basic_skill",
  "certification",
  "certification_on_ccn",
  "certification_on_domaine",
  "convention_collective",
  "degree",
  "department",
  "domaine",
  "drop_out_reason",
  "goal",
  "region",
  "reorientation_reason",
  "training",
  "type_diplome",
  "vulnerability_indicator",
];

const clearDatabase = async () => {
  const tablenames = await prismaClient.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => !DO_NOT_CLEAR_THESE_TABLES.includes(name))
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await prismaClient.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
};

beforeAll(async () => {
  await clearDatabase();
});
