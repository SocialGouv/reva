import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { DematerializedFeasibilityFile } from "@prisma/client";

import { getCertificationCompetenceById } from "@/modules/referential/features/getCertificationCompetenceById";
import { getCompetenceBlocById } from "@/modules/referential/features/getCompetenceBlocById";

import { resolversSecurityMap } from "./dematerialized-feasibility-file.security";
import {
  DematerializedFeasibilityFileCreateOrUpdateAapDecisionInput,
  DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput,
  DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput,
  DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput,
  DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput,
  DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput,
  DematerializedFeasibilityFileCreateOrUpdateEligibilityRequirementInput,
  DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput,
  DematerializedFeasibilityFileCreateOrUpdateSwornStatementInput,
} from "./dematerialized-feasibility-file.types";
import { checkIsDFFReadyToBeSentToCandidateById } from "./features/checkIsDFFReadyToBeSentToCandidateById";
import { checkIsDFFReadyToBeSentToCertificationAuthorityById } from "./features/checkIsDFFReadyToBeSentToCertificationAuthorityById";
import { confirmDematerializedFeasibilityFileByCandidate } from "./features/confirmDematerializedFeasibilityFileByCandidate";
import { createOrUpdateAapDecision } from "./features/createOrUpdateAapDecision";
import { createOrUpdateAttachments } from "./features/createOrUpdateAttachments";
import { createOrUpdateCertificationAuthorityDecision } from "./features/createOrUpdateCertificationAuthorityDecision";
import { createOrUpdateCertificationCompetenceDetails } from "./features/createOrUpdateCertificationCompetenceDetails";
import { createOrUpdateCertificationInfo } from "./features/createOrUpdateCertificationInfo";
import { createOrUpdateEligibilityRequirement } from "./features/createOrUpdateEligibilityRequirement";
import { createOrUpdatePrerequisites } from "./features/createOrUpdatePrerequisites";
import { createOrUpdateSwornStatement } from "./features/createOrUpdateSwornStatement";
import { getCertificationCompetenceDetailsByDFFId } from "./features/getCertificationCompetenceDetailsByDFFId";
import { getDematerializedFeasibilityFileAttachmentsFilesNamesAndUrls } from "./features/getDematerializedFeasibilityFileFilesNamesAndUrls";
import { getDFFCertificationCompetenceBlocByDFFIdAndCertificationCompetenceBlocId } from "./features/getDFFCertificationCompetenceBlocByDFFIdAndCertificationCompetenceBlocId";
import { getDFFCertificationCompetenceBlocsByDFFId } from "./features/getDFFCertificationCompetenceBlocsByDFFId";
import { getDffFileNameAndUrl } from "./features/getDffFileNameAndUrl";
import { getPrerequisitesByDFFId } from "./features/getPrerequisitesByDFFId";
import { getSwornStatementFileWithFileNameAndUrlById } from "./features/getSwornStatementFileWithFileNameAndUrlById";
import { sendDFFToCandidate } from "./features/sendDFFToCandidate";
import { sendDFFToCertificationAuthority } from "./features/sendDFFToCertificationAuthority";

const unsafeResolvers = {
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
    isReadyToBeSentToCandidate: ({
      attachmentsPartComplete,
      certificationPartComplete,
      competenceBlocsPartCompletion,
      prerequisitesPartComplete,
      aapDecision,
      eligibilityRequirement,
    }: DematerializedFeasibilityFile) =>
      checkIsDFFReadyToBeSentToCandidateById({
        attachmentsPartComplete,
        certificationPartComplete,
        competenceBlocsPartCompletion,
        prerequisitesPartComplete,
        aapDecision,
        eligibilityRequirement,
      }),
    isReadyToBeSentToCertificationAuthority: ({
      attachmentsPartComplete,
      certificationPartComplete,
      competenceBlocsPartCompletion,
      prerequisitesPartComplete,
      aapDecision,
      eligibilityRequirement,
      swornStatementFileId,
      candidateConfirmationAt,
    }: DematerializedFeasibilityFile) =>
      checkIsDFFReadyToBeSentToCertificationAuthorityById({
        attachmentsPartComplete,
        certificationPartComplete,
        competenceBlocsPartCompletion,
        prerequisitesPartComplete,
        aapDecision,
        eligibilityRequirement,
        swornStatementFileId,
        candidateConfirmationAt,
      }),
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
    dffFile: ({ id }: { id: string }) =>
      getDffFileNameAndUrl({ dematerializedFeasibilityFileId: id }),
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
  Mutation: {
    dematerialized_feasibility_file_createOrUpdateCertificationInfo: (
      _parent: unknown,
      params: {
        candidacyId: string;
        input: DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput;
      },
    ) => createOrUpdateCertificationInfo(params),
    dematerialized_feasibility_file_createOrUpdateCertificationCompetenceDetails:
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

    dematerialized_feasibility_file_createOrUpdateAapDecision: (
      _parent: unknown,
      params: {
        candidacyId: string;
        input: DematerializedFeasibilityFileCreateOrUpdateAapDecisionInput;
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
      context: GraphqlContext,
    ) => sendDFFToCandidate({ dematerializedFeasibilityFileId, context }),

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
      context: GraphqlContext,
    ) => sendDFFToCertificationAuthority({ ...params, context }),

    dematerialized_feasibility_file_createOrUpdateCertificationAuthorityDecision:
      (
        _parent: unknown,
        params: {
          candidacyId: string;
          input: DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput;
        },
        context: GraphqlContext,
      ) => createOrUpdateCertificationAuthorityDecision({ ...params, context }),

    dematerialized_feasibility_file_confirmCandidate: (
      _parent: unknown,
      {
        dematerializedFeasibilityFileId,
        input,
      }: {
        candidacyId: string;
        dematerializedFeasibilityFileId: string;
        input: DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput;
      },
      context: GraphqlContext,
    ) =>
      confirmDematerializedFeasibilityFileByCandidate({
        dematerializedFeasibilityFileId,
        input,
        context,
      }),

    dematerialized_feasibility_file_createOrUpdateEligibilityRequirement: (
      _parent: unknown,
      params: {
        candidacyId: string;
        input: DematerializedFeasibilityFileCreateOrUpdateEligibilityRequirementInput;
      },
    ) => createOrUpdateEligibilityRequirement(params),
  },
};

export const dematerializedFeasibilityFileResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
