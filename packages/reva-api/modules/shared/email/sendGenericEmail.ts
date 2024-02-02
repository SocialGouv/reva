// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";

import { logger } from "../logger";
import { EmailAccount } from "./email.types";

const defaultClient = SibApiV3Sdk.ApiClient.instance;
// Configure API key authorization: api-key
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY || "secret";

interface GenericEmailArgs {
  to: EmailAccount | EmailAccount[];
  subject: string;
  htmlContent: string;
  sender?: EmailAccount;
  attachment?: { name: string; content: string }[];
}

export const sendGenericEmail = async ({
  to,
  htmlContent,
  sender,
  subject,
  attachment,
}: GenericEmailArgs): Promise<string> => {
  const emailAddresses = Array.isArray(to)
    ? to.map((t) => t.email).join(", ")
    : to.email;

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL CONTENT =======");
    logger.info(htmlContent);
    logger.info("=========================");
    return `email sent to ${emailAddresses}`;
  }

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  try {
    await apiInstance.sendTransacEmail(
      Object.assign(sendSmtpEmail, {
        sender: sender ?? { name: "France VAE", email: "contact@vae.gouv.fr" },
        to: Array.isArray(to) ? to : [to],
        subject,
        htmlContent,
        attachment,
        tags: [process.env.APP_ENV ?? "development"],
      }),
    );
    logger.info(`email sent to ${emailAddresses}`);
    return `email sent to ${emailAddresses}`;
  } catch (e) {
    logger.error("error", e);
    return "error";
  }
};
