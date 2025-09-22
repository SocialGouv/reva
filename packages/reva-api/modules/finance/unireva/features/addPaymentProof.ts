import { UploadedFile } from "@/modules/shared/file/file.interface";

import { addFileToUploadSpooler } from "../database/fileUploadSpooler";
import { getFundingRequest } from "../database/fundingRequests";
import { getPaymentRequestByCandidacyId } from "../database/paymentRequest";

interface AddPaymentProofParams {
  fileMaxSize: number;
  candidacyId: string;
  invoice?: UploadedFile;
  appointment?: UploadedFile;
}

export const addPaymentProof = async ({
  fileMaxSize,
  candidacyId,
  appointment,
  invoice,
}: AddPaymentProofParams) => {
  if (!invoice && !appointment) {
    throw new Error("No document to upload");
  }

  const paymentRequest = await getPaymentRequestByCandidacyId({ candidacyId });
  if (!paymentRequest) {
    throw new Error("Demande de paiement non trouvée");
  }

  const fundingRequest = await getFundingRequest({ candidacyId });

  if (!fundingRequest) {
    throw new Error("Demande de financement non trouvée");
  }
  const fundingRequestNumAction = fundingRequest.numAction;

  if (invoice) {
    if (invoice._buf.byteLength > fileMaxSize) {
      throw new Error("Le fichier envoyé dépasse la taille maximale acceptée");
    }

    await addFileToUploadSpooler({
      description: `Facture pour paymentRequestId ${paymentRequest.id} (${invoice.filename} - ${invoice.mimetype})`,
      destinationFileName: `facture_${fundingRequestNumAction}.${getFilenameExtension(
        invoice.filename,
      )}`,
      destinationPath: "import",
      fileContent: invoice._buf,
    });
  }

  if (appointment) {
    if (appointment._buf.byteLength > fileMaxSize) {
      throw new Error("Le fichier envoyé dépasse la taille maximale acceptée");
    }

    await addFileToUploadSpooler({
      description: `Feuille de présence pour paymentRequestId ${paymentRequest.id} (${appointment.filename} - ${appointment.mimetype})`,
      destinationFileName: `presence_${fundingRequestNumAction}.${getFilenameExtension(
        appointment.filename,
      )}`,
      destinationPath: "import",
      fileContent: appointment._buf,
    });
  }
};

function getFilenameExtension(filename: string) {
  return filename.split(".").pop();
}
