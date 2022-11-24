import cron from "cron";
import pino from "pino";

import { batchFundingRequest } from "./batch/fundingRequest";

const logger = pino();

const fundingRequest = new cron.CronJob({
  cronTime: "*/5 * * * *",
  onTick: async function () {
    const now = new Date();
    logger.info("Batch fundingRequest ticked");
    await batchFundingRequest();
  },
  start: true,
  timeZone: "Europe/Paris",
});

logger.info("Started cron jobs");
