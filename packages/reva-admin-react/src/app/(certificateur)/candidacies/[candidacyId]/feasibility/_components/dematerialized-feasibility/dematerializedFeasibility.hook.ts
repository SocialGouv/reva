import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const feasibilityGetActiveFeasibilityByCandidacyId = graphql(`
  query feasibilityGetActiveFeasibilityByCandidacyId($candidacyId: ID!) {
    feasibility_getActiveFeasibilityByCandidacyId(candidacyId: $candidacyId) {
      id
      decision
      decisionComment
      decisionSentAt
      certificationAuthority {
        id
        label
        contactFullName
        contactEmail
        contactPhone
      }
      history {
        id
        decision
        decisionComment
        decisionSentAt
      }
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
        eligibilityRequirement
        eligibilityValidUntil
      }
      candidacy {
        id
        status
        organism {
          contactAdministrativePhone
          contactAdministrativeEmail
          adresseVille
          adresseCodePostal
          adresseInformationsComplementaires
          adresseNumeroEtNomDeRue
          emailContact
          telephone
          nomPublic
          label
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
        candidacyDropOut {
          createdAt
        }
        isCaduque
        lastActivityDate
        candidacyContestationsCaducite {
          contestationSentAt
          certificationAuthorityContestationDecision
        }
      }
    }
  }
`);

export const createOrUpdateCertificationAuthorityDecision = graphql(`
  mutation createOrUpdateCertificationAuthorityDecision(
    $input: DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput!
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_createOrUpdateCertificationAuthorityDecision(
      input: $input
      candidacyId: $candidacyId
    ) {
      id
    }
  }
`);

const revokeCertificationAuthorityDecisionMutation = graphql(`
  mutation revokeCertificationAuthorityDecision(
    $feasibilityId: ID!
    $reason: String
  ) {
    feasibility_revokeCertificationAuthorityDecision(
      feasibilityId: $feasibilityId
      reason: $reason
    ) {
      id
    }
  }
`);

export const useDematerializedFeasibility = () => {
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
      graphqlClient.request(feasibilityGetActiveFeasibilityByCandidacyId, {
        candidacyId,
      }),
  });

  const feasibility =
    getCandidacyByIdResponse?.feasibility_getActiveFeasibilityByCandidacyId;
  const dematerializedFeasibilityFile =
    feasibility?.dematerializedFeasibilityFile;
  const dematerializedFeasibilityFileId = dematerializedFeasibilityFile?.id;
  const candidacy = feasibility?.candidacy;

  const revokeDecisionMutation = useMutation({
    mutationFn: async (data: { feasibilityId: string; reason: string }) => {
      return graphqlClient.request(
        revokeCertificationAuthorityDecisionMutation,
        data,
      );
    },
  });

  return {
    dematerializedFeasibilityFileId,
    dematerializedFeasibilityFile,
    candidacy,
    feasibility,
    revokeDecision: revokeDecisionMutation,
  };
};
