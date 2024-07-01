import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { DematerializedFeasibilityFile } from "@prisma/client";
import { getCertificationCompetenceById } from "../referential/features/getCertificationCompetenceById";
import { getCompetenceBlocsById } from "../referential/features/getCompetenceBlocsById";
import { resolversSecurityMap } from "./dematerialized-feasibility-file.security";
import {
  DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput,
  DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput,
  DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput,
  DematerializedFeasibilityFileCreateOrUpdateDecisionInput,
  DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput,
  DematerializedFeasibilityFileCreateOrUpdateSwornStatementInput,
} from "./dematerialized-feasibility-file.types";
import { checkIsDFFReadyToBeSentToCandidateById } from "./features/checkIsDFFReadyToBeSentToCandidateById";
import { checkIsDFFReadyToBeSentToCertificationAuthorityById } from "./features/checkIsDFFReadyToBeSentToCertificationAuthorityById";
import { createOrUpdateAapDecision } from "./features/createOrUpdateAapDecision";
import { createOrUpdateAttachments } from "./features/createOrUpdateAttachments";
import { createOrUpdateCertificationCompetenceDetails } from "./features/createOrUpdateCertificationCompetenceDetails";
import { createOrUpdateCertificationInfo } from "./features/createOrUpdateCertificationInfo";
import { createOrUpdatePrerequisites } from "./features/createOrUpdatePrerequisites";
import { createOrUpdateSwornStatement } from "./features/createOrUpdateSwornStatement";
import { getBlocsDeCompetencesByDFFId } from "./features/getBlocsDeCompetencesByDFFId";
import { getCandidacyWithCandidateByCandidacyId } from "./features/getCandidacyByDematerializedFeasibilityId";
import { getCertificationCompetenceDetailsByDFFId } from "./features/getCertificationCompetenceDetailsByDFFId";
import { getDematerializedFeasibilityFileByCandidacyId } from "./features/getDematerializedFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileAttachmentsFilesNamesAndUrls } from "./features/getDematerializedFeasibilityFileFilesNamesAndUrls";
import { getPrerequisitesByDFFId } from "./features/getPrerequisitesByDFFId";
import { getSwornStatementFileWithFileNameAndUrlById } from "./features/getSwornStatementFileWithFileNameAndUrlById";
import { sendDFFToCandidate } from "./features/sendDFFToCandidate";
import { sendDFFToCertificationAuthority } from "./features/sendDFFToCertificationAuthority";

export const unsafeResolvers = {
  DematerializedFeasibilityFile: {
    blocsDeCompetences: (
      {
        id: dematerializedFeasibilityFileId,
      }: {
        id: string;
      },
      { blocDeCompetencesId }: { blocDeCompetencesId?: string },
    ) =>
      blocDeCompetencesId
        ? [getCompetenceBlocsById({ competenceBlocId: blocDeCompetencesId })]
        : getBlocsDeCompetencesByDFFId({ dematerializedFeasibilityFileId }),
    certificationCompetenceDetails: ({
      id: dematerializedFeasibilityFileId,
    }: {
      id: string;
    }) =>
      getCertificationCompetenceDetailsByDFFId({
        dematerializedFeasibilityFileId,
      }),
    prerequisites: ({ id: dematerializedFeasibilityFileId }: { id: string }) =>
      getPrerequisitesByDFFId({ dematerializedFeasibilityFileId }),
    attachments: ({ id: dematerializedFeasibilityFileId }: { id: string }) =>
      getDematerializedFeasibilityFileAttachmentsFilesNamesAndUrls({
        dematerializedFeasibilityFileId,
      }),
    isReadyToBeSentToCandidate: (
      dematerializedFeasibilityFile: DematerializedFeasibilityFile,
    ) =>
      checkIsDFFReadyToBeSentToCandidateById({
        dematerializedFeasibilityFile,
      }),
    isReadyToBeSentToCertificationAuthority: (
      dematerializedFeasibilityFile: DematerializedFeasibilityFile,
    ) =>
      checkIsDFFReadyToBeSentToCertificationAuthorityById({
        dematerializedFeasibilityFile,
      }),
    candidacy: ({ candidacyId }: { candidacyId: string }) =>
      getCandidacyWithCandidateByCandidacyId({ candidacyId }),
    swornStatementFile: ({
      swornStatementFileId,
    }: {
      swornStatementFileId: string;
    }) =>
      getSwornStatementFileWithFileNameAndUrlById({
        swornStatementFileId,
      }),
  },
  CertificationCompetenceDetails: {
    certificationCompetence: ({
      certificationCompetenceId,
    }: {
      certificationCompetenceId: string;
    }) => getCertificationCompetenceById({ certificationCompetenceId }),
  },
  Candidacy: {
    dematerializedFeasibilityFile: ({ id: candidacyId }: { id: string }) =>
      getDematerializedFeasibilityFileByCandidacyId({ candidacyId }),
  },
  Query: {
    dematerialized_feasibility_file_getByCandidacyId: (
      _parent: unknown,
      params: { candidacyId: string },
    ) => getDematerializedFeasibilityFileByCandidacyId(params),
  },
  Mutation: {
    dematerialized_feasibility_file_createOrUpdateCertificationInfo: (
      _parent: unknown,
      params: {
        input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
      },
    ) => createOrUpdateCertificationInfo({ input: params.input }),
    dematerialized_feasibility_file_createOrupdateCertificationCompetenceDetails:
      (
        _parent: unknown,
        params: {
          input: DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput;
        },
      ) =>
        createOrUpdateCertificationCompetenceDetails({
          ...params.input,
        }),
    dematerialized_feasibility_file_createOrUpdatePrerequisites: (
      _parent: unknown,
      params: {
        input: DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput;
      },
    ) => createOrUpdatePrerequisites({ ...params.input }),

    dematerialized_feasibility_file_createOrUpdateDecision: (
      _parent: unknown,
      params: {
        input: DematerializedFeasibilityFileCreateOrUpdateDecisionInput;
      },
    ) => createOrUpdateAapDecision(params.input),
    dematerialized_feasibility_file_createOrUpdateAttachments: (
      _parent: unknown,
      {
        input,
      }: {
        input: DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput;
      },
    ) => createOrUpdateAttachments(input),

    dematerialized_feasibility_file_sendToCandidate: (
      _parent: unknown,
      {
        dematerializedFeasibilityFileId,
      }: { dematerializedFeasibilityFileId: string },
    ) => sendDFFToCandidate({ dematerializedFeasibilityFileId }),

    dematerialized_feasibility_file_createOrUpdateSwornStatement: (
      _parent: unknown,
      params: {
        input: DematerializedFeasibilityFileCreateOrUpdateSwornStatementInput;
      },
    ) => createOrUpdateSwornStatement(params.input),

    dematerialized_feasibility_file_sendToCertificationAuthority: (
      _parent: unknown,
      params: {
        dematerializedFeasibilityFileId: string;
        certificationAuthorityId: string;
      },
    ) => sendDFFToCertificationAuthority(params),
  },
};

export const dematerializedFeasibilityFileResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
