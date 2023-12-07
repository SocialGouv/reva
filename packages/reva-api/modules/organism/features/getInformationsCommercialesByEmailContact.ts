/* eslint-disable @typescript-eslint/no-unused-vars */
import { prismaClient } from "../../../prisma/client";

export const getInformationsCommercialesByEmailContact = ({
  emailContact,
}: {
  emailContact: string;
}) =>
  prismaClient.organismInformationsCommerciales.findMany({
    where: { emailContact },
  });
