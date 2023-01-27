import { Account, FileUploadSpooler } from "@prisma/client";
import {
  Either,
  EitherAsync,
  Just,
  Left,
  Maybe,
  Nothing,
  Right,
} from "purify-ts";

import { Role } from "../types/account";
import {
  Candidacy,
  FileUploadSpoolerEntry,
  PaymentRequest,
} from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";
import { canManageCandidacy } from "./canManageCandidacy";

interface AddPaymentProofDeps {
  hasRole: (role: Role) => boolean;
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  getAccountFromKeycloakId: (
    candidacyId: string
  ) => Promise<Either<string, Account>>;
  getPaymentRequestByCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Maybe<PaymentRequest>>>;
  addFileToUploadSpooler: (
    data: Omit<FileUploadSpooler, "id" | "createdAt">
  ) => Promise<Either<string, string>>;
}

interface AddPaymentProofParams {
  keycloakId: string;
  candidacyId: string;
  invoice?: UploadedFileInfo[];
  appointment?: UploadedFileInfo[];
}

interface UploadedFileInfo {
  data: Buffer;
  filename: string;
  mimetype: string;
  limit: number;
}

export const addPaymentProof = async (
  {
    hasRole,
    getAccountFromKeycloakId,
    getCandidacyFromId,
    getPaymentRequestByCandidacyId,
    addFileToUploadSpooler,
  }: AddPaymentProofDeps,
  {
    candidacyId,
    keycloakId: keycloakId,
    appointment,
    invoice,
  }: AddPaymentProofParams
): Promise<Either<FunctionalError, any>> => {
  if (!invoice && !appointment) {
    return Promise.resolve(
      Left(
        new FunctionalError(
          FunctionalCodeError.UPLOAD_PAYMENT_PROOF_NO_ATTACHEMENT,
          "No document to upload"
        )
      )
    );
  }

  const isAllowedEitherAsync = EitherAsync.fromPromise(() =>
    canManageCandidacy(
      { hasRole, getAccountFromKeycloakId, getCandidacyFromId },
      { candidacyId, keycloakId }
    )
  ).chain((isAllowed) =>
    Promise.resolve(
      isAllowed ? Right(true) : Left("Vous n'êtes pas autorisé à traiter cette candidature")
    )
  );

  let paymentRequestId: string;

  const getPaymentRequestIdEitherAsync = EitherAsync.fromPromise(async () => {
    const paymentRequestEither = await getPaymentRequestByCandidacyId({
      candidacyId,
    });
    if (paymentRequestEither.isRight()) {
      const paymentRequestMaybe = paymentRequestEither.extract();
      if (paymentRequestMaybe.isNothing()) {
        return Left("Payment request not found");
      }
      paymentRequestId = (paymentRequestMaybe.extract() as PaymentRequest).id;
    }
    return paymentRequestEither;
  });

  const addFileToSpoolerEitherAsync = (
    data: FileUploadSpoolerEntry
  ): EitherAsync<string, Maybe<string>> => {
    return EitherAsync.fromPromise(async () => {
      if (data.fileContent) {
        const spoolerIdEither = await addFileToUploadSpooler({
          description: data.description,
          destinationFileName: data.destinationFileName,
          destinationPath: data.destinationPath,
          fileContent: data.fileContent,
        });
        if (spoolerIdEither.isLeft()) {
          return spoolerIdEither;
        }
        return Right(Just(spoolerIdEither.extract()));
      }
      return Promise.resolve(Right(Nothing));
    });
  };

  const addInvoiceToSpooler = (
    numAction: string,
    fileContent?: UploadedFileInfo[]
  ) => {
    const { filename, mimetype } = fileContent?.[0] as UploadedFileInfo;
    return addFileToSpoolerEitherAsync({
      destinationFileName: `facture_${numAction}.${extractFilenameExtension(
        filename
      )}`,
      destinationPath: "/candidacy/payment_request/proof",
      description: `Facture pour paymentRequestId ${paymentRequestId} (${filename} - ${mimetype})`,
      fileContent: fileContent?.[0].data,
    });
  };

  const addAppointmentToSpooler = (
    numAction: string,
    fileContent?: UploadedFileInfo[]
  ) => {
    const { filename, mimetype } = fileContent?.[0] as UploadedFileInfo;
    return addFileToSpoolerEitherAsync({
      destinationFileName: `presence_${numAction}.${extractFilenameExtension(
        filename
      )}`,
      destinationPath: "/candidacy/payment_request/proof",
      description: `Feuille de présence pour paymentRequestId ${paymentRequestId} (${filename} - ${mimetype})`,
      fileContent: fileContent?.[0].data,
    });
  };

  return isAllowedEitherAsync
    .chain(() => getPaymentRequestIdEitherAsync)
    .chain(() =>
      invoice
        ? addInvoiceToSpooler(paymentRequestId, invoice)
        : Promise.resolve(Right(Nothing))
    )
    .chain(() =>
      appointment
        ? addAppointmentToSpooler(paymentRequestId, appointment)
        : Promise.resolve(Right(Nothing))
    )
    .mapLeft(
      (msg) => new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, msg)
    )
    .run();
};

function extractFilenameExtension(filename: string) {
  return filename.split(".").pop();
}
