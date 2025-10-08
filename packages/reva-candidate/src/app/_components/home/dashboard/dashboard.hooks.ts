import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_FOR_DASHBOARD = graphql(`
  query getCandidacyByIdForDashboard($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      appointments(temporalStatusFilter: UPCOMING, limit: 3) {
        rows {
          id
          date
          time
          type
        }
      }
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
`);

export const useCandidacyForDashboard = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data } = useSuspenseQuery({
    queryKey: ["candidacy", "dashboard"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_FOR_DASHBOARD, {
        candidacyId,
      }),
  });

  const candidacy = data?.getCandidacyById;

  const candidacyStatus = candidacy?.status;

  const candidacyAlreadySubmitted = candidacyStatus !== "PROJET";

  return {
    candidacy,
    candidacyAlreadySubmitted,
  };
};

type CandidateForDashboardHookReturnType = ReturnType<
  typeof useCandidacyForDashboard
>;

export type CandidacyUseCandidateForDashboard = NonNullable<
  CandidateForDashboardHookReturnType["candidacy"]
>;
export type JuryUseCandidateForDashboard =
  CandidacyUseCandidateForDashboard["jury"];
export type FeasibilityUseCandidateForDashboard =
  CandidacyUseCandidateForDashboard["feasibility"];
export type ExperiencesUseCandidateForDashboard =
  CandidacyUseCandidateForDashboard["experiences"];
export type OrganismUseCandidateForDashboard =
  CandidacyUseCandidateForDashboard["organism"];
export type DossierDeValidationUseCandidateForDashboard =
  CandidacyUseCandidateForDashboard["activeDossierDeValidation"];
export type CandidacyDropOutUseCandidateForDashboard =
  CandidacyUseCandidateForDashboard["candidacyDropOut"];
