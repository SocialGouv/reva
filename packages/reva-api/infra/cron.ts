import path from "path";

import cron from "cron";
import dotenv from "dotenv";

import { prismaClient } from "./database/postgres/client";
import { batchFundingRequestUnifvae } from "./graphql/finance/unifvae/batches/fundingRequestUnifvae";
import { batchPaymentRequest } from "./graphql/finance/unireva/batches/paymentRequest";
import uploadSpoolerFiles from "./graphql/finance/unireva/batches/paymentRequestProofJob";
import { logger } from "./logger";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

const fundingRequestUnifvae = new cron.CronJob({
  cronTime: process.env.BATCH_FUNDING_REQUEST_UNIFVAE_CRONTIME || "*/5 * * * *",
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.demande-financement-unifvae",
      batchCallback: batchFundingRequestUnifvae,
    }),
  start: true,
  timeZone: "Europe/Paris",
});

const paymentRequestProofUpload = new cron.CronJob({
  cronTime: process.env.BATCH_PAYMENT_REQUEST_PROOF_CRONTIME || "*/2 * * * *",
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.upload-justificatifs",
      batchCallback: uploadSpoolerFiles,
    }),
  start: true,
  timeZone: "Europe/Paris",
});

const paymentRequest = new cron.CronJob({
  cronTime: process.env.BATCH_PAYMENT_REQUEST_CRONTIME || "*/5 * * * *",
  onTick: () =>
    runBatchIfActive({
      batchKey: "batch.demande-paiement",
      batchCallback: batchPaymentRequest,
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

logger.info("Started cron jobs");
