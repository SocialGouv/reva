import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { getCertificationCompetenceById } from "../referential/features/getCertificationCompetenceById";
import { getCompetenceBlocsById } from "../referential/features/getCompetenceBlocsById";
import { resolversSecurityMap } from "./dematerialized-feasibility-file.security";
import {
  DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput,
  DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput,
  DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput,
  DematerializedFeasibilityFileCreateOrUpdateDecisionInput,
  DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput,
} from "./dematerialized-feasibility-file.types";
import { createOrUpdateAttachments } from "./features/createOrUpdateAttachments";
import { createOrUpdateCertificationCompetenceDetails } from "./features/createOrUpdateCertificationCompetenceDetails";
import { createOrUpdateCertificationInfo } from "./features/createOrUpdateCertificationInfo";
import { createOrUpdateDecision } from "./features/createOrUpdateDecision";
import { createOrUpdatePrerequisites } from "./features/createOrUpdatePrerequisites";
import { getBlocsDeCompetencesByDFFId } from "./features/getBlocsDeCompetencesByDFFId";
import { getCertificationCompetenceDetailsByDFFId } from "./features/getCertificationCompetenceDetailsByDFFId";
import { getDematerializedFeasibilityFileByCandidacyId } from "./features/getDematerializedFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileAttachmentsFilesNamesAndUrls } from "./features/getDematerializedFeasibilityFileFilesNamesAndUrls";
import { getPrerequisitesByDFFId } from "./features/getPrerequisitesByDFFId";

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
    ) => createOrUpdateDecision(params.input),
    dematerialized_feasibility_file_createOrUpdateAttachments: (
      _parent: unknown,
      {
        input,
      }: {
        input: DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput;
      },
    ) => createOrUpdateAttachments(input),
  },
};

export const dematerializedFeasibilityFileResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
