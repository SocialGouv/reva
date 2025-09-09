/* eslint-disable @typescript-eslint/no-unused-vars */

import { spawn } from "child_process";
import path from "path";

import { CronJob } from "cron";
import dotenv from "dotenv";

import { checkAndUpdateCandidaciesInactifConfirme } from "@/modules/candidacy/features/checkAndUpdateCandidaciesInactifConfirme";
import { checkAndUpdateCandidaciesInactifEnAttente } from "@/modules/candidacy/features/checkAndUpdateCandidaciesInactifEnAttente";

import { deleteExpiredCandidacies } from "../modules/candidacy/features/deleteExpiredCandidacies";
import { sendAutoCandidacyDropOutConfirmationEmails } from "../modules/candidacy/features/sendAutoCandidacyDropOutConfirmationEmails";
import { sendEmailsForCertificationExpiration } from "../modules/certification-authority/features/sendEmailsForCertificationExpiration";
import { batchAapListUnifvae } from "../modules/finance/unifvae/batches/aapListUnifvae.batch";
import { batchPaymentRequestUnifvae } from "../modules/finance/unifvae/batches/paymentRequestUnifvae";
import { batchPaymentRequest } from "../modules/finance/unireva/batches/paymentRequest";
import uploadSpoolerFiles from "../modules/finance/unireva/batches/paymentRequestProofJob";
import { sendReminderToCandidateWithScheduledJury } from "../modules/jury/features/sendReminderToCandidateWithScheduledJury";
import { sendReminderToCertificationAuthorityFillJuryResults } from "../modules/jury/features/sendReminderToCertificationAuthorityFillJuryResults";
import { setCertificationsVisibleOrNotUsingStatusAndAvailabilityDate } from "../modules/referential/features/setCertificationsVisibleOrNotUsingStatusAndAvailabilityDate";
import { logger } from "../modules/shared/logger";
import { prismaClient } from "../prisma/client";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

const EVERY_DAY_AT_1_AM = "0 1 * * *";
const EVERY_DAY_AT_1_30_AM = "30 1 * * *";
const EVERY_DAY_AT_1_45_AM = "45 1 * * *";
const EVERY_DAY_AT_2_AM = "0 2 * * *";
const EVERY_DAY_AT_3_AM = "0 3 * * *";

const paymentRequestProofUpload = CronJob.from({
  cronTime: process.env.BATCH_PAYMENT_REQUEST_PROOF_CRONTIME || "*/2 * * * *",
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.upload-justificatifs",
      batchCallback: uploadSpoolerFiles,
    }),
  start: true,
  timeZone: "Europe/Paris",
});

const paymentRequest = CronJob.from({
  cronTime: process.env.BATCH_PAYMENT_REQUEST_CRONTIME || "*/5 * * * *",
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.demande-paiement",
      batchCallback: batchPaymentRequest,
    }),
  start: true,
  timeZone: "Europe/Paris",
});

const paymentRequestUnifvae = CronJob.from({
  cronTime: process.env.BATCH_PAYMENT_REQUEST_UNIFVAE_CRONTIME || "*/5 * * * *",
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.demande-paiement-unifvae",
      batchCallback: batchPaymentRequestUnifvae,
    }),
  start: true,
  timeZone: "Europe/Paris",
});

const aapListUnifvae = CronJob.from({
  cronTime: process.env.BATCH_AAP_LIST_UNIFVAE_CRONTIME || "*/5 * * * *",
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.aap-list-unifvae",
      batchCallback: batchAapListUnifvae,
    }),
  start: true,
  timeZone: "Europe/Paris",
});

async function runBatchIfActive({
  batchKey,
  batchCallback,
}: {
  batchKey: string;
  batchCallback: (key: string) => Promise<void>;
}): Promise<void> {
  logger.info(`Batch ${batchKey} ticked`);
  if (await isFeatureActive(batchKey)) {
    return batchCallback(batchKey);
  } else {
    logger.info(`Le batch ${batchKey} est inactif.`);
  }
}

async function isFeatureActive(featureKey: string): Promise<boolean> {
  const feat = await prismaClient.feature.findFirst({
    where: {
      key: featureKey,
    },
  });
  return Boolean(feat && feat.isActive);
}

CronJob.from({
  cronTime:
    process.env.BATCH_ACTIVATE_OR_DEACTIVATE_CERTIFICATIONS_CRONTIME ||
    EVERY_DAY_AT_2_AM,
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.activate-or-deactivate-certifications",
      batchCallback: async () => {
        logger.info("Running activate-or-deactivate-certifications batch");
        await setCertificationsVisibleOrNotUsingStatusAndAvailabilityDate();
      },
    }),
  start: true,
  timeZone: "Europe/Paris",
});

// Send reminder to candidate with scheduled jury
CronJob.from({
  cronTime:
    process.env.BATCH_SEND_REMINDER_TO_CANDIDATE_WITH_SCHEDULED_JURY ||
    EVERY_DAY_AT_1_AM,
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.send-reminder-to-candidate-with-scheduled-jury",
      batchCallback: async () => {
        logger.info(
          "Running send-reminder-to-candidate-with-scheduled-jury batch",
        );
        await sendReminderToCandidateWithScheduledJury();
      },
    }),
  start: true,
  timeZone: "Europe/Paris",
});

// Send reminder to candidate with scheduled jury
CronJob.from({
  cronTime:
    process.env.BATCH_SEND_REMINDER_TO_FILL_JURY_RESULTS || EVERY_DAY_AT_1_AM,
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.send-reminder-to-fill-jury-results",
      batchCallback: async () => {
        logger.info("Running send-reminder-to-fill-jury-results batch");
        await sendReminderToCertificationAuthorityFillJuryResults();
      },
    }),
  start: true,
  timeZone: "Europe/Paris",
});

// Delete expired candidacies
CronJob.from({
  cronTime: process.env.BACTH_DELETE_EXPIRED_CANDIDACIES || EVERY_DAY_AT_2_AM,
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.delete-expired-candidacies",
      batchCallback: async () => {
        logger.info("Running batch.delete-expired-candidacies batch");
        await deleteExpiredCandidacies();
      },
    }),
  start: true,
  timeZone: "Europe/Paris",
});

// Send emails for candidacies drop out that are not confirmed and are more than 4 months old
CronJob.from({
  cronTime:
    process.env.BATCH_SEND_EMAILS_FOR_AUTO_CONFIRMED_CANDIDACY_DROP_OUTS ||
    EVERY_DAY_AT_2_AM,
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.send-emails-for-auto-confirmed-candidacy-drop-outs",
      batchCallback: async () => {
        logger.info(
          "Running batch.send-emails-for-auto-confirmed-candidacy-drop-outs",
        );
        await sendAutoCandidacyDropOutConfirmationEmails();
      },
    }),
  start: true,
  timeZone: "Europe/Paris",
});

// Envoi d'emails aux certificateurs de notification d'expiration de certification
// - Alerte 1 mois avant l'expiration
// - Notification le jour de l'expiration
// Ce batch doit s'exécuter APRÈS batch.activate-or-deactivate-certifications
// pour une raison de confort utilisateur, il vient après la potentielle désactivation d'une certification
CronJob.from({
  cronTime:
    process.env.BATCH_SEND_EMAILS_FOR_CERTIFICATION_EXPIRATION_CRONTIME ||
    EVERY_DAY_AT_3_AM,
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.send-emails-for-certification-expiration",
      batchCallback: async () => {
        logger.info("Running batch.send-emails-for-certification-expiration");
        await sendEmailsForCertificationExpiration();
      },
    }),
  start: true,
  timeZone: "Europe/Paris",
});

// Vérification de l'activité des candidatures actives
// - Si le candidat est inactif avant d'avoir un dossier de faisabilité admissible
// - Si le candidat est inactif après avoir un dossier de faisabilité admissible
// Mise à jour de l'activité des candidatures du statut ACTIF vers INACTIF_EN_ATTENTE
// Envoi d'emails aux candidats
CronJob.from({
  cronTime:
    process.env.BATCH_UPDATE_CANDIDACIES_INACTIF_EN_ATTENTE_CRONTIME ||
    EVERY_DAY_AT_1_30_AM,
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.update-candidacies-inactif-en-attente",
      batchCallback: async () => {
        logger.info("Running batch.update-candidacies-inactif-en-attente");
        await checkAndUpdateCandidaciesInactifEnAttente();
      },
    }),
  start: true,
  timeZone: "Europe/Paris",
});

// Vérification de l'activité des candidatures inactives en attente
// Si la candidature est inactive depuis 15 jours, on la met à jour en INACTIF_CONFIRME
// Mise à jour de l'activité des candidatures du statut INACTIF_EN_ATTENTE vers INACTIF_CONFIRME
CronJob.from({
  cronTime:
    process.env.BATCH_UPDATE_CANDIDACIES_INACTIF_CONFIRME_CRONTIME ||
    EVERY_DAY_AT_1_45_AM,
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.update-candidacies-inactif-confirme",
      batchCallback: async () => {
        logger.info("Running batch.update-candidacies-inactif-confirme");
        await checkAndUpdateCandidaciesInactifConfirme();
      },
    }),
  start: true,
  timeZone: "Europe/Paris",
});

CronJob.from({
  cronTime: "* * * * *",
  onTick: () =>
    runBatchIfActive({
      batchKey: "RESET_SANDBOX_BD",
      batchCallback: async () => {
        logger.info("Running RESET_SANDBOX_BD");
        if (process.env.APP_ENV !== "sandbox") {
          console.log(
            'Not running resetSandboxDb.sh because APP_ENV is not "sandbox"',
          );
          return;
        }
        const resetProcess = spawn("bash", ["./scripts/resetSandboxDb.sh"]);
        resetProcess.stdout.on("data", (data) => {
          logger.info(data.toString());
        });
        resetProcess.stderr.on("data", (data) => {
          logger.error(data.toString());
        });
      },
    }),
  start: true,
  timeZone: "Europe/Paris",
});

logger.info(`Started cron jobs with APP_ENV = "${process.env.APP_ENV}"`);
