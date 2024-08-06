import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

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
          prerequisites {
            label
            state
          }
          firstForeignLanguage
          secondForeignLanguage
          option
          blocsDeCompetences {
            certificationCompetenceBloc {
              id
              code
              label
              isOptional
              FCCompetences
              competences {
                id
                label
              }
            }
          }
          certificationCompetenceDetails {
            text
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
        }
        candidacy {
          certificationAuthorities {
            label
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
            certificationAuthorities {
              id
              label
            }
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
              level
              longLabel
            }
            niveauDeFormationLePlusEleve {
              level
            }
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
            nationality
            gender
            phone
            city
            street
            zip
          }
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
