import path from "path";

import cron from "cron";
import dotenv from "dotenv";

import { batchPaymentRequest } from "./graphql/finance/unireva/batches/paymentRequest";
import uploadSpoolerFiles from "./graphql/finance/unireva/batches/paymentRequestProofJob";
import { logger } from "./logger";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

const paymentRequestProofUpload = new cron.CronJob({
  cronTime: process.env.BATCH_PAYMENT_REQUEST_PROOF_CRONTIME || "*/2 * * * *",
  onTick: async function () {
    logger.info("Batch paymentRequestProofUpload ticked");
    await uploadSpoolerFiles();
  },
  start: true,
  timeZone: "Europe/Paris",
});

const paymentRequest = new cron.CronJob({
  cronTime: process.env.BATCH_PAYMENT_REQUEST_CRONTIME || "*/5 * * * *",
  onTick: async function () {
    logger.info("Batch paymentRequest ticked");
    await batchPaymentRequest();
  },
  start: true,
  timeZone: "Europe/Paris",
});

logger.info("Started cron jobs");
