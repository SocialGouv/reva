// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";

import { logger } from "../logger/logger";

// https://developers.brevo.com/docs/how-it-works#requests
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY || "secret";

export const sendEmailUsingTemplate = async ({
  to,
  templateId,
  params,
  attachment,
}: {
  to: { email: string } | { email: string }[];
  templateId: number;
  params?: object;
  attachment?: { name: string; content: string }[];
}): Promise<void> => {
  const emailAddresses = Array.isArray(to)
    ? to.map((t) => t.email).join(", ")
    : to.email;

  if (process.env.NODE_ENV === "test") {
    logger.info(`email sent to ${emailAddresses}`);
  }

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL CONTENT =======");
    logger.info({ params });
    logger.info("=========================");
    logger.info(`email sent to ${emailAddresses}`);
  } else {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    try {
      await apiInstance.sendTransacEmail({
        templateId,
        to: Array.isArray(to) ? to : [to],
        params,
        attachment,
      });
      logger.info(`email sent to ${emailAddresses}`);
    } catch (e: any) {
      logger.error(`error sending email to ${emailAddresses}`);
      logger.error(e);
    }
  }
};
