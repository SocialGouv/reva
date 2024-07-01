import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const sendToCertificationAuthority = graphql(`
  mutation sendToCertificationAuthority(
    $dematerializedFeasibilityFileId: ID!
    $certificationAuthorityId: ID!
  ) {
    dematerialized_feasibility_file_sendToCertificationAuthority(
      dematerializedFeasibilityFileId: $dematerializedFeasibilityFileId
      certificationAuthorityId: $certificationAuthorityId
    )
  }
`);

const dematerializedFeasibilityFileSendFileCertificationAuthorityByCandidacyId =
  graphql(`
    query dematerializedFeasibilityFileSendFileCertificationAuthorityByCandidacyId(
      $candidacyId: ID!
    ) {
      dematerialized_feasibility_file_getByCandidacyId(
        candidacyId: $candidacyId
      ) {
        id
        swornStatementFile {
          name
          previewUrl
          mimeType
        }
        sentToCandidateAt
        sentToCertificationAuthorityAt
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
        certificationCompetenceDetails {
          text
          certificationCompetence {
            id
            label
          }
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
        attachments {
          type
          file {
            name
            previewUrl
            mimeType
          }
        }
      }
    }
  `);

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
        dematerializedFeasibilityFileSendFileCertificationAuthorityByCandidacyId,
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
      }),
  });

  const dematerializedFeasibilityFile =
    getCandidacyByIdResponse?.dematerialized_feasibility_file_getByCandidacyId;
  const dematerializedFeasibilityFileId = dematerializedFeasibilityFile?.id;

  return {
    dematerializedFeasibilityFileId,
    sendToCertificationAuthorityMutation,
    dematerializedFeasibilityFile,
  };
};
