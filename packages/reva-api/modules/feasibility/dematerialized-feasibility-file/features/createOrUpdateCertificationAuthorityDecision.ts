import { CandidacyStatusStep } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";
import {
  deleteFile,
  emptyUploadedFileStream,
  getUploadedFile,
  uploadFilesToS3,
} from "../../../../modules/shared/file";
import { prismaClient } from "../../../../prisma/client";
import { updateCandidacyStatus } from "../../../candidacy/features/updateCandidacyStatus";
import {
  sendFeasibilityIncompleteMailToAAP,
  sendFeasibilityRejectedToCandidateAccompagneEmail,
  sendFeasibilityRejectedToCandidateAutonomeEmail,
  sendFeasibilityValidatedToCandidateAccompagneEmail,
  sendFeasibilityValidatedToCandidateAutonomeEmail,
} from "../../emails";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput } from "../dematerialized-feasibility-file.types";
import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileWithDetailsByCandidacyId } from "./getDematerializedFeasibilityFileWithDetailsByCandidacyId";
import { resetDFFSentToCandidateState } from "./resetDFFSentToCandidateState";

const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";

const statusDecisionMapper = {
  ADMISSIBLE: "DOSSIER_FAISABILITE_RECEVABLE",
  REJECTED: "DOSSIER_FAISABILITE_NON_RECEVABLE",
  INCOMPLETE: "DOSSIER_FAISABILITE_INCOMPLET",
};

export const createOrUpdateCertificationAuthorityDecision = async ({
  candidacyId,
  input,
}: {
  candidacyId: string;
  input: DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput;
}) => {
  try {
    const dff = await getDematerializedFeasibilityFileWithDetailsByCandidacyId({
      candidacyId,
    });

    if (!dff) {
      throw new Error(
        `Aucun Dossier de faisabilité trouvé pour la candidature ${candidacyId}.`,
      );
    }

    const { decision, decisionFile, decisionComment } = input;

    const feasibility = dff.feasibility;

    const existingDecisionFileId = feasibility.decisionFileId;
    if (existingDecisionFileId) {
      const existingDecisionFile = await prismaClient.file.findUnique({
        where: { id: existingDecisionFileId },
      });

      if (existingDecisionFile) {
        await deleteFile(existingDecisionFile.path);
        await prismaClient.file.delete({
          where: { id: existingDecisionFileId },
        });
      }
    }

    let decisionFileForDb = null;
    if (decisionFile) {
      const decisionUploadedFile = await getUploadedFile(decisionFile);
      const fileId = uuidV4();
      const fileAndId: {
        id: string;
        data: Buffer;
        filePath: string;
        mimeType: string;
        name: string;
      } = {
        id: fileId,
        data: decisionUploadedFile._buf,
        filePath: getFilePath({ candidacyId, fileId }),
        mimeType: decisionUploadedFile.mimetype,
        name: decisionUploadedFile.filename,
      };

      await uploadFilesToS3([fileAndId]);

      decisionFileForDb = {
        create: {
          id: fileId,
          path: fileAndId.filePath,
          name: fileAndId.name,
          mimeType: fileAndId.mimeType,
        },
      };
    }

    const now = new Date().toISOString();
    await prismaClient.$transaction(async (tx) => {
      await tx.feasibility.update({
        where: {
          id: feasibility.id,
        },
        data: {
          decision,
          decisionComment,
          decisionSentAt: now,
          decisionFile: decisionFileForDb ? decisionFileForDb : undefined,
        },
      }),
        await tx.feasibilityDecision.create({
          data: {
            decision,
            decisionComment,
            feasibilityId: feasibility.id,
          },
        }),
        await updateCandidacyStatus({
          candidacyId,
          status: statusDecisionMapper[decision] as CandidacyStatusStep,
          tx,
        });
    });

    if (decision === "INCOMPLETE") {
      await prismaClient.feasibility.update({
        where: {
          id: feasibility.id,
        },
        data: {
          feasibilityFileSentAt: null,
        },
      });

      await resetDFFSentToCandidateState(dff);
      const aapEmail =
        dff.feasibility.candidacy.organism?.contactAdministrativeEmail;
      if (aapEmail) {
        sendFeasibilityIncompleteMailToAAP({
          email: aapEmail,
          feasibilityUrl: `${baseUrl}/admin2/candidacies/${candidacyId}/feasibility-aap`,
          comment: decisionComment,
        });
      }
    }

    const candidateEmail = dff.feasibility.candidacy.candidate?.email;
    const certifName = dff.feasibility.candidacy.certification?.label;
    const certificationAuthorityLabel =
      dff.feasibility.candidacy.certification?.certificationAuthorityStructure
        ?.label;

    if (candidateEmail && certifName && certificationAuthorityLabel) {
      const isAutonome =
        dff.feasibility.candidacy.typeAccompagnement === "AUTONOME";
      if (decision === "ADMISSIBLE") {
        if (isAutonome) {
          sendFeasibilityValidatedToCandidateAutonomeEmail({
            email: candidateEmail,
            comment: decisionComment,
            certifName,
            certificationAuthorityLabel,
          });
        } else {
          sendFeasibilityValidatedToCandidateAccompagneEmail({
            email: candidateEmail,
            comment: decisionComment,
            certifName,
            certificationAuthorityLabel,
          });
        }
      }

      if (decision === "REJECTED") {
        if (isAutonome) {
          sendFeasibilityRejectedToCandidateAutonomeEmail({
            email: candidateEmail,
            comment: decisionComment,
            certificationAuthorityLabel,
            certificationName: certifName,
          });
        } else {
          sendFeasibilityRejectedToCandidateAccompagneEmail({
            email: candidateEmail,
            comment: decisionComment,
            certificationAuthorityLabel,
          });
        }
      }
    }

    return getDematerializedFeasibilityFileByCandidacyId({
      candidacyId,
    });
  } finally {
    //every stream must be emptied otherwise the request will hang
    emptyUploadedFileStream(input.decisionFile);
  }
};

const getFilePath = ({
  candidacyId,
  fileId,
}: {
  candidacyId: string;
  fileId: string;
}) => `candidacies/${candidacyId}/dff_files/${fileId}`;
