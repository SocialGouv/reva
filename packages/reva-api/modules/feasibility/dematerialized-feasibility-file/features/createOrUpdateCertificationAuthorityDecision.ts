import { FeasibilityDecision, FeasibilityStatus } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";

import { updateCandidacyStatus } from "@/modules/candidacy/features/updateCandidacyStatus";
import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { allowFileTypeByDocumentType } from "@/modules/shared/file/allowFileTypes";
import { UploadedFile } from "@/modules/shared/file/file.interface";
import {
  emptyUploadedFileStream,
  getUploadedFile,
  uploadFilesToS3,
} from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

import { sendFeasibilityDecisionTakenToAAPEmail } from "../../emails/sendFeasibilityDecisionTakenToAAPEmail";
import { sendFeasibilityIncompleteMailToAAP } from "../../emails/sendFeasibilityIncompleteMailToAAP";
import { sendFeasibilityIncompleteToCandidateAutonomeEmail } from "../../emails/sendFeasibilityIncompleteToCandidateAutonomeEmail";
import { sendFeasibilityRejectedToCandidateAccompagneEmail } from "../../emails/sendFeasibilityRejectedToCandidateAccompagneEmail";
import { sendFeasibilityRejectedToCandidateAutonomeEmail } from "../../emails/sendFeasibilityRejectedToCandidateAutonomeEmail";
import { sendFeasibilityValidatedToCandidateAccompagneEmail } from "../../emails/sendFeasibilityValidatedToCandidateAccompagneEmail";
import { sendFeasibilityValidatedToCandidateAutonomeEmail } from "../../emails/sendFeasibilityValidatedToCandidateAutonomeEmail";
import { deleteFeasibilityIDFile } from "../../features/deleteFeasibilityIDFile";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput } from "../dematerialized-feasibility-file.types";

import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileWithDetailsByCandidacyId } from "./getDematerializedFeasibilityFileWithDetailsByCandidacyId";
import { resetDFFSentToCandidateState } from "./resetDFFSentToCandidateState";

const adminBaseUrl =
  process.env.ADMIN_REACT_BASE_URL || "https://vae.gouv.fr/admin2";

const decisionMapper = {
  ADMISSIBLE: {
    status: "DOSSIER_FAISABILITE_RECEVABLE",
    log: "FEASIBILITY_VALIDATED",
  },
  REJECTED: {
    status: "DOSSIER_FAISABILITE_NON_RECEVABLE",
    log: "FEASIBILITY_REJECTED",
  },
  INCOMPLETE: {
    status: "DOSSIER_FAISABILITE_INCOMPLET",
    log: "FEASIBILITY_MARKED_AS_INCOMPLETE",
  },
  COMPLETE: {
    status: "DOSSIER_FAISABILITE_COMPLET",
    log: "FEASIBILITY_MARKED_AS_COMPLETE",
  },
} as const;

const sendFeasibilityDecisionTakenEmail = async ({
  candidateEmail,
  aapEmail,
  decision,
  decisionComment,
  certificationName,
  certificationAuthorityLabel,
  isAutonome,
  candidacyId,
  decisionUploadedFile,
}: {
  candidateEmail: string;
  aapEmail: string;
  decision: FeasibilityDecision["decision"];
  decisionComment: string;
  certificationName: string;
  certificationAuthorityLabel: string;
  isAutonome: boolean;
  candidacyId: string;
  decisionUploadedFile?: UploadedFile;
}) => {
  if (decision === "INCOMPLETE") {
    if (isAutonome) {
      sendFeasibilityIncompleteToCandidateAutonomeEmail({
        email: candidateEmail,
        comment: decisionComment,
        certificationAuthorityLabel,
        certificationName,
      });
    } else {
      sendFeasibilityIncompleteMailToAAP({
        email: aapEmail,
        feasibilityUrl: `${adminBaseUrl}/candidacies/${candidacyId}/feasibility`,
        comment: decisionComment,
      });
    }
  } else if (decision === "REJECTED") {
    if (isAutonome) {
      sendFeasibilityRejectedToCandidateAutonomeEmail({
        email: candidateEmail,
        comment: decisionComment,
        certificationAuthorityLabel,
        certificationName,
      });
    } else {
      sendFeasibilityRejectedToCandidateAccompagneEmail({
        email: candidateEmail,
        comment: decisionComment,
        certificationAuthorityLabel,
        certificationName,
      });
    }
  } else if (decision === "ADMISSIBLE") {
    if (isAutonome) {
      sendFeasibilityValidatedToCandidateAutonomeEmail({
        email: candidateEmail,
        comment: decisionComment,
        certificationAuthorityLabel,
        certificationName,
        infoFile: decisionUploadedFile,
      });
    } else {
      sendFeasibilityValidatedToCandidateAccompagneEmail({
        email: candidateEmail,
        comment: decisionComment,
        certificationAuthorityLabel,
        certificationName,
        infoFile: decisionUploadedFile,
      });
      sendFeasibilityDecisionTakenToAAPEmail({
        email: aapEmail,
        feasibilityUrl: `${adminBaseUrl}/candidacies/${candidacyId}/feasibility-aap`,
      });
    }
  }
};

export const createOrUpdateCertificationAuthorityDecision = async ({
  candidacyId,
  input,
  context,
}: {
  candidacyId: string;
  input: DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput;
  context: GraphqlContext;
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

    if (
      feasibility.decision == FeasibilityStatus.ADMISSIBLE ||
      feasibility.decision == FeasibilityStatus.REJECTED
    ) {
      throw new Error("Le faisabilité a déjà été prononcée sur ce dossier");
    }

    if (
      (feasibility.decision == FeasibilityStatus.COMPLETE ||
        feasibility.decision == FeasibilityStatus.INCOMPLETE) &&
      ["COMPLETE", "INCOMPLETE"].includes(decision)
    ) {
      throw new Error("Le faisabilité a déjà été marquée sur ce dossier");
    }

    let decisionFileForDb = null;
    let decisionUploadedFile;
    if (decisionFile) {
      decisionUploadedFile = await getUploadedFile(decisionFile);
      const fileId = uuidV4();
      const fileAndId: {
        id: string;
        data: Buffer;
        filePath: string;
        mimeType: string;
        name: string;
        allowedFileTypes: string[];
      } = {
        id: fileId,
        data: decisionUploadedFile._buf,
        filePath: getFilePath({ candidacyId, fileId }),
        mimeType: decisionUploadedFile.mimetype,
        name: decisionUploadedFile.filename,
        allowedFileTypes:
          allowFileTypeByDocumentType.certificationAuthorityDecisionFile,
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
      });

      await tx.feasibilityDecision.create({
        data: {
          decision,
          decisionComment,
          feasibilityId: feasibility.id,
          decisionFileId: decisionFileForDb?.create.id,
        },
      });

      await updateCandidacyStatus({
        candidacyId,
        status: decisionMapper[decision].status,
        tx,
      });
    });

    const isAutonome =
      dff.feasibility.candidacy.typeAccompagnement === "AUTONOME";

    const candidateEmail = dff.feasibility.candidacy.candidate?.email as string;
    const certificationName =
      dff.feasibility.candidacy.certification?.label ||
      "certification inconnue";
    const certificationAuthorityLabel =
      dff.feasibility.candidacy.certification?.certificationAuthorityStructure
        ?.label || "certificateur inconnu";
    const aapEmail = dff.feasibility.candidacy.organism
      ?.contactAdministrativeEmail as string;

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
    }

    if (decision === "ADMISSIBLE" || decision === "REJECTED") {
      await deleteFeasibilityIDFile(feasibility.id);
    }

    sendFeasibilityDecisionTakenEmail({
      candidateEmail,
      aapEmail,
      decision,
      decisionComment,
      certificationName,
      certificationAuthorityLabel,
      isAutonome,
      candidacyId,
      decisionUploadedFile,
    });

    await logCandidacyAuditEvent({
      candidacyId,
      eventType: decisionMapper[decision].log,
      userKeycloakId: context.auth.userInfo?.sub,
      userEmail: context.auth.userInfo?.email,
      userRoles: context.auth.userInfo?.realm_access?.roles || [],
    });

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
