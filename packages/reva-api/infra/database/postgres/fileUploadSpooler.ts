import { FileUploadSpooler } from "@prisma/client";
import { Either, Left, Right } from "purify-ts";

import { logger } from "../../logger";
import { prismaClient } from "./client";

export const addFileToUploadSpooler = async ({
  destinationFileName,
  destinationPath,
  description,
  fileContent,
}: Omit<FileUploadSpooler, "id" | "createdAt">): Promise<
  Either<string, string>
> => {
  try {
    const fileSpooler = await prismaClient.fileUploadSpooler.create({
      data: {
        destinationFileName,
        destinationPath,
        description,
        fileContent,
      },
    });
    return Right(fileSpooler.id);
  } catch (e) {
    logger.error(e);
    return Left(`Failed add file upload spooler - ${e}`);
  }
};
