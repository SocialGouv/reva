import { readFileSync } from "fs";
import path from "path";

import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

type ASPJuryResult = {
  candidacy_id: string;
  "resultat fvae": string;
  date_convocation_jury_plenier: string;
  date_passage_jury_plenier: string;
};

type ApplyResult = {
  json_rows_count: bigint;
  unique_candidacy_rows_count: bigint;
  expected_juries_count: bigint;
  inserted_juries_count: bigint;
  inserted_logs_count: bigint;
};

const main = async () => {
  const apply = process.argv.includes("--apply");
  const candidaciesFile = readFileSync(
    path.join(__dirname, "resultats_asp.json"),
    "utf8",
  );

  const candidacies: ASPJuryResult[] = JSON.parse(candidaciesFile);
  const uniqueCandidacyIds = new Set<string>();
  const duplicatedCandidacyIds = new Set<string>();

  for (const { candidacy_id } of candidacies) {
    if (uniqueCandidacyIds.has(candidacy_id)) {
      duplicatedCandidacyIds.add(candidacy_id);
    }

    uniqueCandidacyIds.add(candidacy_id);
  }

  if (apply && candidacies.length !== uniqueCandidacyIds.size) {
    throw new Error(
      [
        "Incohérence dans le fichier: les compteurs ne correspondent pas.",
        `Lignes JSON lues: ${candidacies.length}`,
        `Candidatures uniques dans le fichier: ${uniqueCandidacyIds.size}`,
        "Candidatures en doublon:",
        ...duplicatedCandidacyIds,
      ].join("\n"),
    );
  }

  if (!apply) {
    await dryRun(candidacies, [...duplicatedCandidacyIds]);
    return;
  }

  await applyJuryResults(candidacies);
};

const dryRun = async (
  candidacies: ASPJuryResult[],
  duplicatedCandidacyIds: string[],
) => {
  const missingCandidacyIds: string[] = [];
  const candidacyIdsWithActiveJury: string[] = [];
  const candidacyIdsWithActiveJuryWithResult: string[] = [];
  const candidacyIdsWithActiveJuryWithoutResult: string[] = [];
  const candidacyIdsWithOnlyInactiveJuries: string[] = [];
  const candidacyIdsWithOnlyInactiveJuriesAndResult: string[] = [];
  const candidacyIdsWithOnlyInactiveJuriesWithoutResult: string[] = [];
  const candidacyIdsWithoutActiveDossierDeValidation: string[] = [];
  const candidaciesById = new Map(
    candidacies.map((candidacy) => [candidacy.candidacy_id, candidacy]),
  );
  const uniqueCandidacies = [...candidaciesById.values()];
  const candidacyIds = uniqueCandidacies.map(
    (candidacy) => candidacy.candidacy_id,
  );

  console.log(
    `DRY RUN: ${candidacies.length} ligne(s) de résultats ASP lue(s)`,
  );

  if (duplicatedCandidacyIds.length > 0) {
    printDryRunResult(
      "Candidatures en doublon dans le fichier",
      duplicatedCandidacyIds,
    );
    console.log(
      `Le dry run continue sur ${uniqueCandidacies.length} candidature(s) unique(s).`,
    );
  }

  console.log(
    "Chargement des candidatures, jurys et dossiers de validation actifs en base...",
  );

  const existingCandidacies = await prismaClient.candidacy.findMany({
    where: { id: { in: candidacyIds } },
    select: {
      id: true,
      Jury: {
        select: { isActive: true, result: true },
      },
      dossierDeValidation: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });
  const existingCandidaciesById = new Map(
    existingCandidacies.map((candidacy) => [candidacy.id, candidacy]),
  );

  console.log(`${existingCandidacies.length} candidature(s) trouvée(s).`);

  for (const candidacy of uniqueCandidacies) {
    const existingCandidacy = existingCandidaciesById.get(
      candidacy.candidacy_id,
    );

    if (!existingCandidacy) {
      missingCandidacyIds.push(candidacy.candidacy_id);
      continue;
    }

    const activeJuries = existingCandidacy.Jury.filter((jury) => jury.isActive);
    const inactiveJuries = existingCandidacy.Jury.filter(
      (jury) => !jury.isActive,
    );

    if (activeJuries.length > 0) {
      candidacyIdsWithActiveJury.push(candidacy.candidacy_id);
    }

    if (activeJuries.some((jury) => jury.result)) {
      candidacyIdsWithActiveJuryWithResult.push(candidacy.candidacy_id);
    }

    if (activeJuries.length > 0 && activeJuries.every((jury) => !jury.result)) {
      candidacyIdsWithActiveJuryWithoutResult.push(candidacy.candidacy_id);
    }

    if (activeJuries.length === 0 && existingCandidacy.Jury.length > 0) {
      candidacyIdsWithOnlyInactiveJuries.push(candidacy.candidacy_id);

      if (inactiveJuries.some((jury) => jury.result)) {
        candidacyIdsWithOnlyInactiveJuriesAndResult.push(
          candidacy.candidacy_id,
        );
      } else {
        candidacyIdsWithOnlyInactiveJuriesWithoutResult.push(
          candidacy.candidacy_id,
        );
      }
    }

    if (existingCandidacy.dossierDeValidation.length === 0) {
      candidacyIdsWithoutActiveDossierDeValidation.push(candidacy.candidacy_id);
    }
  }

  printDryRunResult("Candidatures introuvables", missingCandidacyIds);
  printDryRunResult(
    "Candidatures avec jury actif existant",
    candidacyIdsWithActiveJury,
  );
  printDryRunResult(
    "Dont candidatures avec jury actif mais sans résultat",
    candidacyIdsWithActiveJuryWithoutResult,
  );
  console.log("");
  printDryRunResult(
    "Candidatures avec uniquement des jurys inactifs",
    candidacyIdsWithOnlyInactiveJuries,
  );
  console.log(
    `Dont avec au moins un résultat sur jury inactif: ${candidacyIdsWithOnlyInactiveJuriesAndResult.length}`,
  );
  console.log(
    `Dont sans aucun résultat sur jury inactif: ${candidacyIdsWithOnlyInactiveJuriesWithoutResult.length}`,
  );
  console.log("");
  printDryRunResult(
    "Candidatures sans dossier de validation actif",
    candidacyIdsWithoutActiveDossierDeValidation,
  );

  const candidacyIdsIgnored = new Set([
    ...missingCandidacyIds,
    ...candidacyIdsWithActiveJury,
    ...candidacyIdsWithOnlyInactiveJuries,
    ...candidacyIdsWithoutActiveDossierDeValidation,
  ]);
  const juriesToCreateCount =
    uniqueCandidacies.length - candidacyIdsIgnored.size;

  console.log("");
  console.log(
    `${missingCandidacyIds.length} candidature(s) introuvable(s) seront ignorée(s).`,
  );
  console.log(
    `${candidacyIdsWithActiveJury.length} candidature(s) avec jury actif existant seront ignorée(s).`,
  );
  console.log(
    `Dont ${candidacyIdsWithActiveJuryWithResult.length} avec résultat déjà renseigné.`,
  );
  console.log(
    `${candidacyIdsWithOnlyInactiveJuries.length} candidature(s) avec uniquement des jurys inactifs seront ignorée(s).`,
  );
  console.log(
    `${candidacyIdsWithoutActiveDossierDeValidation.length} candidature(s) sans dossier de validation actif seront ignorée(s).`,
  );
  console.log(
    `Relancer avec --apply pour créer ${juriesToCreateCount} jury(s) et ${juriesToCreateCount} log(s) admin.`,
  );
};

const applyJuryResults = async (candidacies: ASPJuryResult[]) => {
  const adminKeycloakId = process.env.ASP_IMPORT_ADMIN_KEYCLOAK_ID;
  const adminEmail = process.env.ASP_IMPORT_ADMIN_EMAIL;

  if (!adminKeycloakId || !adminEmail) {
    throw new Error(
      "ASP_IMPORT_ADMIN_KEYCLOAK_ID et ASP_IMPORT_ADMIN_EMAIL sont requis pour --apply.",
    );
  }

  console.log(
    `APPLY: ${candidacies.length} ligne(s) de résultats ASP à traiter`,
  );

  const result = await prismaClient.$transaction(async (tx) => {
    const [result] = await tx.$queryRaw<ApplyResult[]>(Prisma.sql`
      WITH json_rows AS (
        SELECT *
        FROM jsonb_to_recordset(${JSON.stringify(candidacies)}::jsonb) AS s(
          candidacy_id uuid,
          "resultat fvae" text,
          date_convocation_jury_plenier text,
          date_passage_jury_plenier text
        )
      ),
      unique_candidacy_rows AS (
        SELECT DISTINCT ON (candidacy_id)
          candidacy_id,
          "resultat fvae" AS result,
          to_date(date_convocation_jury_plenier, 'DD/MM/YYYY')::timestamptz AS date_of_session,
          CASE
            WHEN NULLIF(date_passage_jury_plenier, '') IS NULL THEN NULL
            ELSE to_date(date_passage_jury_plenier, 'DD/MM/YYYY')::timestamptz
          END AS date_of_result
        FROM json_rows
      ),
      target AS (
        SELECT DISTINCT ON (unique_candidacy_rows.candidacy_id)
          unique_candidacy_rows.candidacy_id,
          unique_candidacy_rows.result,
          unique_candidacy_rows.date_of_session,
          unique_candidacy_rows.date_of_result,
          dossier_de_validation.certification_authority_id
        FROM unique_candidacy_rows
        JOIN candidacy ON candidacy.id = unique_candidacy_rows.candidacy_id
        JOIN dossier_de_validation
          ON dossier_de_validation.candidacy_id = unique_candidacy_rows.candidacy_id
          AND dossier_de_validation.is_active = true
        ORDER BY unique_candidacy_rows.candidacy_id, dossier_de_validation.created_at DESC
      ),
      juries_to_insert AS (
        SELECT target.*
        FROM target
        WHERE NOT EXISTS (
          SELECT 1
          FROM jury
          WHERE jury.candidacy_id = target.candidacy_id
        )
        AND (SELECT COUNT(*) FROM json_rows) = (SELECT COUNT(*) FROM unique_candidacy_rows)
      ),
      inserted_juries AS (
        INSERT INTO jury (
          candidacy_id,
          certification_authority_id,
          result,
          date_of_session,
          date_of_result,
          is_active,
          is_result_temporary,
          created_at,
          updated_at
        )
        SELECT
          target.candidacy_id,
          target.certification_authority_id,
          target.result,
          target.date_of_session,
          target.date_of_result,
          true,
          false,
          now(),
          now()
        FROM juries_to_insert AS target
        RETURNING candidacy_id
      ),
      inserted_logs AS (
        INSERT INTO candidacy_log (
          user_keycloak_id,
          user_email,
          user_profile,
          candidacy_id,
          event_type,
          details,
          created_at,
          updated_at
        )
        SELECT
          ${adminKeycloakId}::uuid,
          ${adminEmail},
          'ADMIN',
          candidacy_id,
          'ADMIN_CUSTOM_ACTION',
          jsonb_build_object('message', 'Ajout des informations de jury via le batch ASP'),
          now(),
          now()
        FROM inserted_juries
        RETURNING candidacy_id
      )
      SELECT
        (SELECT COUNT(*) FROM json_rows) AS json_rows_count,
        (SELECT COUNT(*) FROM unique_candidacy_rows) AS unique_candidacy_rows_count,
        (SELECT COUNT(*) FROM juries_to_insert) AS expected_juries_count,
        (SELECT COUNT(*) FROM inserted_juries) AS inserted_juries_count,
        (SELECT COUNT(*) FROM inserted_logs) AS inserted_logs_count
    `);

    if (!result) {
      throw new Error("L'import ASP n'a retourné aucun résultat.");
    }

    const expectedJuriesCount = Number(result.expected_juries_count);
    const transactionJuriesCount = Number(result.inserted_juries_count);
    const transactionLogsCount = Number(result.inserted_logs_count);
    const jsonRowsCount = Number(result.json_rows_count);
    const uniqueCandidacyRowsCount = Number(result.unique_candidacy_rows_count);

    if (
      jsonRowsCount !== uniqueCandidacyRowsCount ||
      transactionJuriesCount !== expectedJuriesCount ||
      transactionLogsCount !== transactionJuriesCount
    ) {
      throw new Error(
        [
          "L'import ASP a échoué: les compteurs ne correspondent pas.",
          `Lignes JSON lues: ${jsonRowsCount}`,
          `Candidatures uniques dans le fichier: ${uniqueCandidacyRowsCount}`,
          `Jurys à créer: ${expectedJuriesCount}`,
          `Jurys préparés dans la transaction: ${transactionJuriesCount}`,
          `Logs admin préparés dans la transaction: ${transactionLogsCount}`,
        ].join("\n"),
      );
    }

    return result;
  });

  console.log(`Jurys à créer: ${Number(result.expected_juries_count)}`);
  console.log(`Jurys créés: ${Number(result.inserted_juries_count)}`);
  console.log(`Logs admin créés: ${Number(result.inserted_logs_count)}`);
  console.log("Import ASP terminé: les compteurs jurys/logs correspondent.");
};

const printDryRunResult = (label: string, candidacyIds: string[]) => {
  console.log(`${label}: ${candidacyIds.length}`);
  for (const candidacyId of candidacyIds) {
    console.log(`- ${candidacyId}`);
  }
};

main();
