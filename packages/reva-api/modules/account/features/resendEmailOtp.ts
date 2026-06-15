import { getAccountByEmail } from "./getAccountByEmail";
import { sendEmailOtp } from "./sendEmailOtp";

export const resendEmailOtp = async ({ email }: { email: string }) => {
  const account = await getAccountByEmail(email);
  if (!account) {
    throw new Error("Compte non trouvé");
  }

  await sendEmailOtp({ accountId: account.id });
};
