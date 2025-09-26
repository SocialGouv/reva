import { useSuspenseQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_WITH_CANDIDACY = graphql(`
  query candidate_getCandidateWithCandidacyForDashboard {
    candidate_getCandidateWithCandidacy {
      candidacy {
        readyForJuryEstimatedAt
        sentAt
        endAccompagnementStatus
        endAccompagnementDate
        activeDossierDeValidation {
          decision
        }
        certificationAuthorityLocalAccounts {
          contactFullName
          contactEmail
          contactPhone
        }
        status
        typeAccompagnement
        firstAppointmentOccuredAt
        candidacyStatuses {
          status
        }
        candidacyDropOut {
          proofReceivedByAdmin
          createdAt
          dropOutConfirmedByCandidate
        }
        certification {
          id
          label
          codeRncp
        }
        goals {
          id
        }
        experiences {
          id
        }
        organism {
          id
          label
          contactAdministrativeEmail
          contactAdministrativePhone
          nomPublic
          emailContact
          telephone
          adresseNumeroEtNomDeRue
          adresseInformationsComplementaires
          adresseCodePostal
          adresseVille
        }
        feasibility {
          feasibilityFileSentAt
          decision
          feasibilityFormat
          dematerializedFeasibilityFile {
            swornStatementFileId
            candidateConfirmationAt
            sentToCandidateAt
          }
          certificationAuthority {
            contactEmail
            contactFullName
            contactPhone
            label
          }
        }
        jury {
          isResultTemporary
          dateOfSession
          timeOfSession
          timeSpecified
          result
        }
        cohorteVaeCollective {
          id
          nom
          commanditaireVaeCollective {
            raisonSociale
          }
        }
      }
    }
  }
`);

export const useCandidacyForDashboard = () => {
  const { graphqlClient } = useGraphQlClient();
  const { data } = useSuspenseQuery({
    queryKey: ["candidate", "dashboard"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY),
  });

  const candidate = data?.candidate_getCandidateWithCandidacy;

  const candidacy = candidate?.candidacy;

  const candidacyStatus = candidacy?.status;

  const candidacyAlreadySubmitted = candidacyStatus !== "PROJET";

  const feasibility = candidacy?.feasibility;

  return {
    candidacy,
    candidacyAlreadySubmitted,
    feasibility,
  };
};

type CandidateForDashboardHookReturnType = ReturnType<
  typeof useCandidacyForDashboard
>;
export type CandidacyUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"];
export type JuryUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["jury"];
export type FeasibilityUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["feasibility"];
export type ExperiencesUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["experiences"];
export type OrganismUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["organism"];
export type DossierDeValidationUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["activeDossierDeValidation"];
export type CandidacyDropOutUseCandidateForDashboard =
  CandidateForDashboardHookReturnType["candidacy"]["candidacyDropOut"];
