import { FileUploadSpooler } from "@prisma/client";
import {
  Either,
  EitherAsync,
  Just,
  Left,
  Maybe,
  Nothing,
  Right,
} from "purify-ts";

import { UploadedFile } from "../../infra/rest/proof-upload";
import { FileUploadSpoolerEntry, PaymentRequest } from "../types/candidacy";
import { FundingRequest } from "../types/candidate";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface AddPaymentProofDeps {
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
  candidacyId: string;
  invoice?: UploadedFile[];
  appointment?: UploadedFile[];
}

export const addPaymentProof =
  (fileMaxSize: number) =>
  async (
    {
      getPaymentRequestByCandidacyId,
      getFundingRequestFromCandidacyId,
      addFileToUploadSpooler,
    }: AddPaymentProofDeps,
    { candidacyId, appointment, invoice }: AddPaymentProofParams
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
          if (data.fileContent.byteLength > fileMaxSize) {
            return Left("Le fichier envoyé dépasse la taille maximale acceptée");
          }
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

    const addInvoiceToSpooler = (fileContent?: UploadedFile[]) => {
      const { filename, mimetype } = fileContent?.[0] as UploadedFile;
      return addFileToSpoolerEitherAsync({
        destinationFileName: `facture_${fundingRequestNumAction}.${getFilenameExtension(
          filename
        )}`,
        destinationPath: "import",
        description: `Facture pour paymentRequestId ${paymentRequestId} (${filename} - ${mimetype})`,
        fileContent: fileContent?.[0].data,
      });
    };

    const addAppointmentToSpooler = (fileContent?: UploadedFile[]) => {
      const { filename, mimetype } = fileContent?.[0] as UploadedFile;
      return addFileToSpoolerEitherAsync({
        destinationFileName: `presence_${fundingRequestNumAction}.${getFilenameExtension(
          filename
        )}`,
        destinationPath: "import",
        description: `Feuille de présence pour paymentRequestId ${paymentRequestId} (${filename} - ${mimetype})`,
        fileContent: fileContent?.[0].data,
      });
    };

    return getPaymentRequestIdEitherAsync
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
