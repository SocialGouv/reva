import path from "path";

import cron from "cron";
import dotenv from "dotenv";
import pino from "pino";

import { batchFundingRequest } from "./batch/fundingRequest";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

const logger = pino();

const fundingRequest = new cron.CronJob({
  cronTime: "*/1 * * * *",
  onTick: async function () {
    const now = new Date();
    logger.info("Batch fundingRequest ticked");
    await batchFundingRequest();
  },
  start: true,
  timeZone: "Europe/Paris",
});

logger.info("Started cron jobs");
