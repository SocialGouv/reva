import { readFileSync } from "fs";
import path from "path";

import { parse } from "date-fns";

import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

const main = async () => {
  const candidaciesFile = readFileSync(
    path.join(__dirname, "resultats_asp.json"),
    "utf8",
  );

  const candidacies = JSON.parse(candidaciesFile);

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

main();
