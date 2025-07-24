import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const sendToCertificationAuthority = graphql(`
  mutation sendToCertificationAuthority(
    $dematerializedFeasibilityFileId: ID!
    $certificationAuthorityId: ID!
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_sendToCertificationAuthority(
      dematerializedFeasibilityFileId: $dematerializedFeasibilityFileId
      certificationAuthorityId: $certificationAuthorityId
      candidacyId: $candidacyId
    )
  }
`);

const getActiveFeasibilitySendFileCertificationAuthorityByCandidacyId = graphql(
  `
    query getActiveFeasibilitySendFileCertificationAuthorityByCandidacyId(
      $candidacyId: ID!
    ) {
      feasibility_getActiveFeasibilityByCandidacyId(candidacyId: $candidacyId) {
        feasibilityFileSentAt
        decision
        decisionSentAt
        decisionComment
        dematerializedFeasibilityFile {
          id
          swornStatementFile {
            name
            previewUrl
            mimeType
          }
          sentToCandidateAt
          aapDecision
          aapDecisionComment
          candidateDecisionComment
          prerequisites {
            label
            state
          }
          firstForeignLanguage
          secondForeignLanguage
          option
          blocsDeCompetences {
            text
            certificationCompetenceBloc {
              id
              code
              label
              FCCompetences
              competences {
                id
                label
              }
            }
          }
          certificationCompetenceDetails {
            state
            certificationCompetence {
              id
              label
            }
          }
          attachments {
            type
            file {
              name
              previewUrl
              mimeType
            }
          }
          isReadyToBeSentToCertificationAuthority
          eligibilityRequirement
          eligibilityValidUntil
        }
        candidacy {
          certificationAuthorities {
            id
            label
          }
          feasibility {
            certificationAuthority {
              id
              label
              contactFullName
              contactEmail
              contactPhone
            }
          }
          certificationAuthorityLocalAccounts {
            contactFullName
            contactEmail
            contactPhone
          }
          individualHourCount
          collectiveHourCount
          additionalHourCount
          basicSkills {
            label
            id
          }
          mandatoryTrainings {
            label
            id
          }
          certification {
            label
            codeRncp
            level
            degree {
              longLabel
              level
            }
          }
          goals {
            id
            label
            isActive
          }
          experiences {
            id
            title
            startedAt
            duration
            description
          }
          certificateSkills
          candidate {
            highestDegree {
              longLabel
            }
            niveauDeFormationLePlusEleve {
              longLabel
            }
            highestDegreeLabel
            firstname
            firstname2
            firstname3
            lastname
            email
            givenName
            birthdate
            birthCity
            birthDepartment {
              label
              code
              region {
                code
                label
              }
            }
            country {
              id
              label
            }
            nationality
            gender
            phone
            city
            street
            zip
          }
          isCaduque
          lastActivityDate
        }
      }
    }
  `,
);

export const useSendFileCertificationAuthority = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyByIdResponse } = useQuery({
    queryKey: [
      candidacyId,
      "dematerializedFeasibilityFileSendFileCertificationAuthorityByCandidacyId",
    ],
    queryFn: () =>
      graphqlClient.request(
        getActiveFeasibilitySendFileCertificationAuthorityByCandidacyId,
        {
          candidacyId,
        },
      ),
  });

  const { mutateAsync: sendToCertificationAuthorityMutation } = useMutation({
    mutationFn: ({
      dematerializedFeasibilityFileId,
      certificationAuthorityId,
    }: {
      dematerializedFeasibilityFileId: string;
      certificationAuthorityId: string;
    }) =>
      graphqlClient.request(sendToCertificationAuthority, {
        dematerializedFeasibilityFileId,
        certificationAuthorityId,
        candidacyId,
      }),
  });

  const feasibility =
    getCandidacyByIdResponse?.feasibility_getActiveFeasibilityByCandidacyId;
  const candidacy = feasibility?.candidacy;
  const dematerializedFeasibilityFile =
    feasibility?.dematerializedFeasibilityFile;
  const dematerializedFeasibilityFileId = dematerializedFeasibilityFile?.id;

  return {
    dematerializedFeasibilityFileId,
    candidacy,
    sendToCertificationAuthorityMutation,
    dematerializedFeasibilityFile,
    feasibility,
  };
};
