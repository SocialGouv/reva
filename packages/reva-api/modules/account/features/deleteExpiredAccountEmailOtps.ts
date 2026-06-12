import { addMinutes } from "date-fns";

import { prismaClient } from "@/prisma/client";

export const deleteExpiredAccountEmailOtps = async () => {
  const now = new Date();
  const tenMinutesAgo = addMinutes(now, -10);

  await prismaClient.accountEmailOtp.deleteMany({
    where: {
      createdAt: { lt: tenMinutesAgo },
    },
  });
};
