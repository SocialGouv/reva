import { addMinutes } from "date-fns";

import { prismaClient } from "@/prisma/client";

export const deleteExpiredAccountEmailOtps = async () => {
  const now = new Date();
  const thirtyMinutesAgo = addMinutes(now, -30);

  await prismaClient.accountEmailOtp.deleteMany({
    where: {
      createdAt: { lt: thirtyMinutesAgo },
    },
  });
};
