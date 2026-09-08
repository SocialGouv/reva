import { AuthenticatorOtpStep } from "./AuthenticatorOtpStep";
import { EmailOtpStep } from "./EmailOtpStep";

export const OtpStep = ({
  email,
  otpError,
  pending,
  otpType,
}: {
  email: string;
  otpError?: string;
  pending: boolean;
  otpType: "authenticator" | "email";
}) =>
  otpType === "authenticator" ? (
    <AuthenticatorOtpStep email={email} otpError={otpError} pending={pending} />
  ) : (
    <EmailOtpStep email={email} otpError={otpError} pending={pending} />
  );
