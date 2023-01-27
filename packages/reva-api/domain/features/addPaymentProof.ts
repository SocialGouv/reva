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
import { FundingRequest } from "../types/candidate";
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
  getFundingRequestFromCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, FundingRequest | null>>;
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
    getFundingRequestFromCandidacyId,
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
      isAllowed
        ? Right(true)
        : Left("Vous n'êtes pas autorisé à traiter cette candidature")
    )
  );

  let paymentRequestId: string, fundingRequestNumAction: string;

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

  const getNumActionEitherAsync = EitherAsync.fromPromise(async () => {
    const fundingRequestEither = await getFundingRequestFromCandidacyId({
      candidacyId,
    });
    if (fundingRequestEither.isRight()) {
      const fundingRequest = fundingRequestEither.extract();
      if (fundingRequest === null) {
        return Left("Funding request not found");
      }
      fundingRequestNumAction = fundingRequest.numAction;
    }
    return fundingRequestEither;
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

  const addInvoiceToSpooler = (fileContent?: UploadedFileInfo[]) => {
    const { filename, mimetype } = fileContent?.[0] as UploadedFileInfo;
    return addFileToSpoolerEitherAsync({
      destinationFileName: `facture_${fundingRequestNumAction}.${getFilenameExtension(
        filename
      )}`,
      destinationPath: "/candidacy/payment_request/proof",
      description: `Facture pour paymentRequestId ${paymentRequestId} (${filename} - ${mimetype})`,
      fileContent: fileContent?.[0].data,
    });
  };

  const addAppointmentToSpooler = (fileContent?: UploadedFileInfo[]) => {
    const { filename, mimetype } = fileContent?.[0] as UploadedFileInfo;
    return addFileToSpoolerEitherAsync({
      destinationFileName: `presence_${fundingRequestNumAction}.${getFilenameExtension(
        filename
      )}`,
      destinationPath: "/candidacy/payment_request/proof",
      description: `Feuille de présence pour paymentRequestId ${paymentRequestId} (${filename} - ${mimetype})`,
      fileContent: fileContent?.[0].data,
    });
  };

  return isAllowedEitherAsync
    .chain(() => getPaymentRequestIdEitherAsync)
    .chain(() => getNumActionEitherAsync)
    .chain(() =>
      invoice ? addInvoiceToSpooler(invoice) : Promise.resolve(Right(Nothing))
    )
    .chain(() =>
      appointment
        ? addAppointmentToSpooler(appointment)
        : Promise.resolve(Right(Nothing))
    )
    .mapLeft(
      (msg) => new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, msg)
    )
    .run();
};

function getFilenameExtension(filename: string) {
  return filename.split(".").pop();
}
