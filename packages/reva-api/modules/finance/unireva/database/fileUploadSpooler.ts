import { FileUploadSpooler } from "@prisma/client";

import { prismaClient } from "../../../../prisma/client";

export const addFileToUploadSpooler = async ({
  destinationFileName,
  destinationPath,
  description,
  fileContent,
}: Omit<FileUploadSpooler, "id" | "createdAt">) =>
  prismaClient.fileUploadSpooler.create({
    data: {
      destinationFileName,
      destinationPath,
      description,
      fileContent,
    },
  });
