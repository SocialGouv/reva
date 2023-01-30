import path from "path";

import cron from "cron";
import dotenv from "dotenv";
import pino from "pino";

import { batchFundingRequest } from "./batch/fundingRequest";
import uploadSpoolerFiles from "./batch/paymentRequestProofJob";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

const logger = pino();

const fundingRequest = new cron.CronJob({
  cronTime: process.env.BATCH_FUNDING_REQUEST_CRONTIME || "*/5 * * * *",
  onTick: async function () {
    logger.info("Batch fundingRequest ticked");
    await batchFundingRequest();
  },
  start: true,
  timeZone: "Europe/Paris",
});

const paymentRequestProofUpload = new cron.CronJob({
  cronTime: process.env.BATCH_PAYMENT_REQUEST_PROOF_CRONTIME || "*/2 * * * *",
  onTick: async function () {
    logger.info("Batch paymentRequestProofUpload ticked");
    await uploadSpoolerFiles();
  },
  start: true,
  timeZone: "Europe/Paris",
});

logger.info("Started cron jobs");
