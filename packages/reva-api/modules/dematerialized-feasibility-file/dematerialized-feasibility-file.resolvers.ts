import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { DematerializedFeasibilityFile } from "@prisma/client";
import { getCertificationCompetenceById } from "../referential/features/getCertificationCompetenceById";
import { getCompetenceBlocById } from "../referential/features/getCompetenceBlocById";
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
import { getCandidacyWithCandidateByCandidacyId } from "./features/getCandidacyByDematerializedFeasibilityId";
import { getCertificationCompetenceDetailsByDFFId } from "./features/getCertificationCompetenceDetailsByDFFId";
import { getDFFCertificationCompetenceBlocByDFFIdAndCertificationCompetenceBlocId } from "./features/getDFFCertificationCompetenceBlocByDFFIdAndCertificationCompetenceBlocId";
import { getDFFCertificationCompetenceBlocsByDFFId } from "./features/getDFFCertificationCompetenceBlocsByDFFId";
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
        ? [
            getDFFCertificationCompetenceBlocByDFFIdAndCertificationCompetenceBlocId(
              {
                dematerializedFeasibilityFileId,
                certificationCompetenceBlocId: blocDeCompetencesId,
              },
            ),
          ]
        : getDFFCertificationCompetenceBlocsByDFFId({
            dematerializedFeasibilityFileId,
          }),
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
      swornStatementFileId?: string;
    }) =>
      swornStatementFileId
        ? getSwornStatementFileWithFileNameAndUrlById({
            swornStatementFileId,
          })
        : null,
  },
  DFFCertificationCompetenceBloc: {
    certificationCompetenceBloc: ({
      certificationCompetenceBlocId,
    }: {
      certificationCompetenceBlocId: string;
    }) =>
      getCompetenceBlocById({
        competenceBlocId: certificationCompetenceBlocId,
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
        candidacyId: string;
        input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
      },
    ) => createOrUpdateCertificationInfo(params),
    dematerialized_feasibility_file_createOrupdateCertificationCompetenceDetails:
      (
        _parent: unknown,
        params: {
          candidacyId: string;
          input: DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput;
        },
      ) =>
        createOrUpdateCertificationCompetenceDetails({
          ...params.input,
        }),
    dematerialized_feasibility_file_createOrUpdatePrerequisites: (
      _parent: unknown,
      params: {
        candidacyId: string;
        input: DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput;
      },
    ) => createOrUpdatePrerequisites(params),

    dematerialized_feasibility_file_createOrUpdateDecision: (
      _parent: unknown,
      params: {
        candidacyId: string;
        input: DematerializedFeasibilityFileCreateOrUpdateDecisionInput;
      },
    ) => createOrUpdateAapDecision(params),
    dematerialized_feasibility_file_createOrUpdateAttachments: (
      _parent: unknown,
      params: {
        candidacyId: string;
        input: DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput;
      },
    ) => createOrUpdateAttachments(params),

    dematerialized_feasibility_file_sendToCandidate: (
      _parent: unknown,
      {
        dematerializedFeasibilityFileId,
      }: { candidacyId: string; dematerializedFeasibilityFileId: string },
    ) => sendDFFToCandidate({ dematerializedFeasibilityFileId }),

    dematerialized_feasibility_file_createOrUpdateSwornStatement: (
      _parent: unknown,
      params: {
        candidacyId: string;
        input: DematerializedFeasibilityFileCreateOrUpdateSwornStatementInput;
      },
    ) => createOrUpdateSwornStatement(params),

    dematerialized_feasibility_file_sendToCertificationAuthority: (
      _parent: unknown,
      params: {
        candidacyId: string;
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
