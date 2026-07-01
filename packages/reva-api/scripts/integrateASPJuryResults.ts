import { readFileSync } from "fs";
import path from "path";

import { parse } from "date-fns";

import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

const main = async () => {
  const apply = process.argv.includes("--apply");
  const candidaciesFile = readFileSync(
    path.join(__dirname, "resultats_asp.json"),
    "utf8",
  );

  const candidacies = JSON.parse(candidaciesFile);

  if (!apply) {
    await dryRun(candidacies);
    return;
  }

  for (const candidacy of candidacies) {
    try {
      console.log(`Processing candidacy ${candidacy.candidacy_id}`);

      const juryResult = candidacy["resultat fvae"];
      await prismaClient.jury.create({
        data: {
          candidacyId: candidacy.candidacy_id as string,
          result: juryResult,
          isResultTemporary: true,
          certificationAuthorityId: "<CERTIFICATION_AUTHORITY_ID>",
          dateOfSession: parse(
            candidacy.date_convocation_jury_plenier,
            "dd/MM/yyyy",
            new Date(),
          ),
          dateOfResult: parse(
            candidacy.date_passage_jury_plenier,
            "dd/MM/yyyy",
            new Date(),
          ),
          isActive: true,
        },
      });

      await logCandidacyAuditEvent({
        candidacyId: candidacy.candidacy_id as string,
        tx: prismaClient,
        eventType: "JURY_RESULT_UPDATED",
        details: {
          result: juryResult,
        },
        userKeycloakId: "<KEYCLOAK_ID>",
        userEmail: "<EMAIL>",
        userRoles: ["admin"],
      });

      const juries = await prismaClient.jury.findMany({
        where: {
          candidacyId: candidacy.candidacy_id as string,
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (juries.length > 1) {
        console.log(
          `Multiple juries found for candidacy ${candidacy.candidacy_id}`,
        );
        await prismaClient.jury.update({
          where: { id: juries[0].id },
          data: { isActive: false },
        });
      }
    } catch (error) {
      console.error(
        `Error processing candidacy ${candidacy.candidacy_id}: ${error}`,
      );
    }
  }
};

const dryRun = async (candidacies: { candidacy_id: string }[]) => {
  const missingCandidacyIds: string[] = [];
  const candidacyIdsWithActiveJury: string[] = [];
  const candidacyIdsWithActiveJuryWithResult: string[] = [];
  const candidacyIdsWithActiveJuryWithoutResult: string[] = [];
  const candidacyIdsWithOnlyInactiveJuries: string[] = [];
  const candidacyIdsWithOnlyInactiveJuriesAndResult: string[] = [];
  const candidacyIdsWithOnlyInactiveJuriesWithoutResult: string[] = [];
  const candidacyIdsWithoutActiveDossierDeValidation: string[] = [];
  const candidacyIds = candidacies.map((candidacy) => candidacy.candidacy_id);

  console.log(`DRY RUN: ${candidacies.length} résultats ASP trouvés`);
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

  for (const candidacy of candidacies) {
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
  const candidacyIdsToWrite = candidacies.length - candidacyIdsIgnored.size;

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
    `Relancer avec --apply pour écrire ${candidacyIdsToWrite} candidature(s).`,
  );
};

const printDryRunResult = (label: string, candidacyIds: string[]) => {
  console.log(`${label}: ${candidacyIds.length}`);
  for (const candidacyId of candidacyIds) {
    console.log(`- ${candidacyId}`);
  }
};

main();
