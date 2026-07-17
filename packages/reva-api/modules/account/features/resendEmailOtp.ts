import { COMPTE_NON_TROUVE } from "@/modules/shared/errors/messages";

import { getAccountByEmail } from "./getAccountByEmail";
import { sendEmailOtp } from "./sendEmailOtp";

export const resendEmailOtp = async ({ email }: { email: string }) => {
  const account = await getAccountByEmail(email);
  if (!account) {
    throw new Error(COMPTE_NON_TROUVE);
  }

  await sendEmailOtp({ accountId: account.id });
};
