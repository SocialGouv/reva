import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { BrevoClient } from "@getbrevo/brevo";

import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";

import { prismaClient } from "../prisma/client";

// Rappel de paiement (template Brevo 710) aux AAP ayant des candidatures
// Uniformation finançables sans demande de paiement confirmee. Resout les
// num_action de uniformation_num_actions.json en candidatures, groupe par AAP,
// envoie un email par AAP a l'email de contact de l'organisme.
//
// Idempotent : chaque envoi est trace dans uniformation_sent.json ; un re-run
// saute les AAP deja envoyes et ne retente que les echecs.
//
// --dry-run : log le regroupement sans rien envoyer.

const TEMPLATE_ID = 710;
const NUM_ACTIONS_PATH = path.resolve(
  __dirname,
  "uniformation_num_actions.json",
);
// Ledger dans le repertoire temporaire : survit aux reruns tant que le container
// est up, sans jamais toucher le repo.
const LEDGER_PATH = path.join(os.tmpdir(), "uniformation_sent.json");

// true = envoye, false = echec a reprendre.
type SentLedger = Record<string, boolean>;

const loadLedger = (): SentLedger => {
  if (!fs.existsSync(LEDGER_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(LEDGER_PATH, "utf-8"));
};

const saveLedger = (ledger: SentLedger): void => {
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
};

interface AapData {
  aapLabel: string;
  aapEmail: string;
  candidates: { fullName: string; candidacyUrl: string }[];
}

const loadNumActions = (): string[] => {
  if (!fs.existsSync(NUM_ACTIONS_PATH)) {
    throw new Error(`Fichier introuvable : ${NUM_ACTIONS_PATH}`);
  }
  const numActions = JSON.parse(fs.readFileSync(NUM_ACTIONS_PATH, "utf-8"));
  if (!Array.isArray(numActions)) {
    throw new Error("uniformation_num_actions.json doit contenir un tableau");
  }
  return [...new Set<string>(numActions)];
};

// num_action peut vivre dans funding_request ou funding_request_unifvae : on
// interroge les deux et on log les non-resolus.
const resolveCandidacyIds = async (numActions: string[]): Promise<string[]> => {
  const [fundingRequests, fundingRequestsUnifvae] = await Promise.all([
    prismaClient.fundingRequest.findMany({
      where: { numAction: { in: numActions } },
      select: { numAction: true, candidacyId: true },
    }),
    prismaClient.fundingRequestUnifvae.findMany({
      where: { numAction: { in: numActions } },
      select: { numAction: true, candidacyId: true },
    }),
  ]);

  console.log(
    `Matches funding_request : ${fundingRequests.length}, funding_request_unifvae : ${fundingRequestsUnifvae.length}`,
  );

  const matched = new Set<string>();
  const candidacyIds = new Set<string>();
  for (const { numAction, candidacyId } of [
    ...fundingRequests,
    ...fundingRequestsUnifvae,
  ]) {
    matched.add(numAction);
    candidacyIds.add(candidacyId);
  }

  const unmatched = numActions.filter((na) => !matched.has(na));
  if (unmatched.length > 0) {
    console.warn(
      `${unmatched.length} num_action sans correspondance (a verifier avant envoi) :`,
    );
    console.warn(unmatched.join("\n"));
  }

  return [...candidacyIds];
};

const main = async (): Promise<void> => {
  try {
    const dryRun = process.argv.includes("--dry-run");
    const numActions = loadNumActions();
    console.log(`${numActions.length} num_action a resoudre...`);

    const candidacyIds = await resolveCandidacyIds(numActions);
    console.log(`${candidacyIds.length} candidacyId resolus`);

    const candidacies = await prismaClient.candidacy.findMany({
      where: { id: { in: candidacyIds } },
      include: {
        organism: true,
        candidate: true,
        paymentRequest: { select: { confirmedAt: true } },
        paymentRequestUnifvae: { select: { confirmedAt: true } },
      },
    });
    console.log(`${candidacies.length} candidatures trouvees`);

    const aaps: Record<string, AapData> = {};
    let skipped = 0;

    for (const candidacy of candidacies) {
      // Ignore les candidatures dont la demande de paiement est deja confirmee.
      if (
        candidacy.paymentRequest?.confirmedAt ||
        candidacy.paymentRequestUnifvae?.confirmedAt
      ) {
        console.warn(
          `Candidature ${candidacy.id} ignoree : demande de paiement deja confirmee`,
        );
        skipped += 1;
        continue;
      }

      const aapId = candidacy.organism?.id;
      const aapEmail =
        candidacy.organism?.emailContact ||
        candidacy.organism?.contactAdministrativeEmail;
      const candidateFullName =
        candidacy.candidate?.firstname && candidacy.candidate?.lastname
          ? `${candidacy.candidate.firstname} ${candidacy.candidate.lastname}`.trim()
          : null;
      const aapLabel = candidacy.organism?.label;

      if (!aapEmail || !candidateFullName || !aapLabel || !aapId) {
        console.warn(
          `Candidature ${candidacy.id} ignoree : donnees manquantes (organisme/email/nom)`,
        );
        skipped += 1;
        continue;
      }

      const candidate = {
        fullName: candidateFullName,
        candidacyUrl: getBackofficeUrl({
          path: `/candidacies/${candidacy.id}/summary`,
        }),
      };

      if (!aaps[aapId]) {
        aaps[aapId] = { aapLabel, aapEmail, candidates: [candidate] };
      } else {
        aaps[aapId].candidates.push(candidate);
      }
    }

    console.log(
      `Regroupe en ${Object.keys(aaps).length} AAP, ${skipped} candidatures ignorees`,
    );

    const ledger = loadLedger();

    if (dryRun) {
      const aapIds = Object.keys(aaps);
      const candidatures = Object.values(aaps).reduce(
        (n, g) => n + g.candidates.length,
        0,
      );
      const dejaEnvoyes = aapIds.filter((id) => ledger[id] === true).length;
      const enEchec = aapIds.filter((id) => ledger[id] === false).length;
      console.log("=== DRY-RUN : aucun envoi ===");
      console.log(`AAP concernes : ${aapIds.length}`);
      console.log(`Candidatures a relancer : ${candidatures}`);
      console.log(`Candidatures ignorees : ${skipped}`);
      console.log(`Deja envoyes : ${dejaEnvoyes}`);
      console.log(
        `A envoyer : ${aapIds.length - dejaEnvoyes} (dont ${enEchec} en echec a reprendre)`,
      );
      const example = Object.values(aaps)[0];
      if (example) {
        console.log("Exemple de params :", JSON.stringify(example, null, 2));
      }
      return;
    }

    // Envoi direct (le helper partage avale les erreurs) pour tracer succes/echec
    // par AAP. maxRetries absorbe les erreurs transitoires avant de marquer un echec.
    const brevo = new BrevoClient({
      apiKey: process.env.SENDINBLUE_API_KEY || "",
      maxRetries: 3,
    });

    let sent = 0;
    let failed = 0;
    let alreadySent = 0;

    for (const [aapId, data] of Object.entries(aaps)) {
      if (ledger[aapId] === true) {
        alreadySent += 1;
        continue;
      }
      try {
        await brevo.transactionalEmails
          .sendTransacEmail({
            templateId: TEMPLATE_ID,
            to: [{ email: data.aapEmail }],
            params: {
              aapLabel: data.aapLabel,
              candidates: data.candidates,
            },
          })
          .withRawResponse();
        ledger[aapId] = true;
        sent += 1;
      } catch (e) {
        ledger[aapId] = false;
        failed += 1;
        console.error(
          `Echec AAP ${aapId} (${data.aapEmail}) - sera repris au re-run`,
          e,
        );
      }
      // Persiste apres chaque envoi pour resister a une interruption.
      saveLedger(ledger);
    }

    console.log(
      `${sent} envoyes, ${failed} en echec, ${alreadySent} deja envoyes (ignores). ` +
        `Re-lancer le script pour retenter les echecs.`,
    );
  } catch (error) {
    console.error("Echec de l'envoi des rappels Uniformation :", error);
    process.exit(1);
  } finally {
    await prismaClient.$disconnect();
  }
};

main();
