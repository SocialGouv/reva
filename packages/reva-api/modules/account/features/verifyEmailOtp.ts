import { prismaClient } from "@/prisma/client";

export const verifyEmailOtp = async ({
  accountId,
  userOtp,
}: {
  accountId: string;
  userOtp: string;
}) => {
  const accountEmailOtp = await prismaClient.accountEmailOtp.findUnique({
    where: {
      accountId,
    },
  });

  const actualOtp = accountEmailOtp?.otp;

  if (!actualOtp) {
    throw new Error("OTP non trouvé");
  }

  if (userOtp !== actualOtp) {
    throw new Error("OTP non valide");
  }

  await prismaClient.accountEmailOtp.deleteMany({
    where: {
      accountId,
    },
  });
};
