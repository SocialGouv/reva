/* eslint-disable @typescript-eslint/no-unused-vars */

import path from "path";

import { CronJob } from "cron";
import dotenv from "dotenv";

import { batchAapListUnifvae } from "../modules/finance/unifvae/batches/aapListUnifvae.batch";
import { batchFundingRequestUnifvae } from "../modules/finance/unifvae/batches/fundingRequestUnifvae";
import { batchPaymentRequestUnifvae } from "../modules/finance/unifvae/batches/paymentRequestUnifvae";
import { batchPaymentRequest } from "../modules/finance/unireva/batches/paymentRequest";
import uploadSpoolerFiles from "../modules/finance/unireva/batches/paymentRequestProofJob";
import { logger } from "../modules/shared/logger";
import { prismaClient } from "../prisma/client";
import { makeCertificationsAvailableIfAvailableAtDateIsPast } from "../modules/referential/features/makeCertificationsAvailableIfAvailableAtDateIsPast";
import { deactivateCertificationsIfExpiresAtDateIsPast } from "../modules/referential/features/deactivateCertificationsIfExpiresAtDateIsPast";
import { sendReminderToCandidateWithScheduledJury } from "../modules/jury/features/sendReminderToCandidateWithScheduledJury";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

const fundingRequestUnifvae = CronJob.from({
  cronTime: process.env.BATCH_FUNDING_REQUEST_UNIFVAE_CRONTIME || "*/5 * * * *",
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.demande-financement-unifvae",
      batchCallback: batchFundingRequestUnifvae,
    }),
  start: true,
  timeZone: "Europe/Paris",
});

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

export async function runBatchIfActive({
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
    "*/5 * * * *",
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.activate-or-deactivate-certifications",
      batchCallback: async () => {
        logger.info("Running activate-or-deactivate-certifications batch");
        await makeCertificationsAvailableIfAvailableAtDateIsPast();
        await deactivateCertificationsIfExpiresAtDateIsPast();
      },
    }),
  start: true,
  timeZone: "Europe/Paris",
});

// Send reminder to candidate with scheduled jury
CronJob.from({
  cronTime:
    process.env.BATCH_SEND_REMINDER_TO_CANDIDATE_WITH_SCHEDULED_JURY ||
    "* 8 * * *",
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

logger.info(`Started cron jobs with APP_ENV = "${process.env.APP_ENV}"`);
