import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { REST_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyWithFeasibilityUploadedPdfQuery = graphql(`
  query getCandidacyWithFeasibilityUploadedPdfQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      certification {
        label
      }
      candidate {
        firstname
        lastname
        phone
        email
      }
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
      candidacyDropOut {
        status
      }
      status
      typeAccompagnement
      feasibility {
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
        feasibilityUploadedPdf {
          IDFile {
            url
            name
            previewUrl
          }
          feasibilityFile {
            url
            name
            previewUrl
          }
          documentaryProofFile {
            url
            name
            previewUrl
          }
          certificateOfAttendanceFile {
            url
            name
            previewUrl
          }
        }
      }
      feasibilityFormat
      isCaduque
      lastActivityDate
      candidacyContestationsCaducite {
        contestationSentAt
        certificationAuthorityContestationDecision
      }
    }
  }
`);

export const useFeasibilityUploadedPdf = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const { accessToken } = useKeycloakContext();

  const { data: getFeasibilityResponse } = useQuery({
    queryKey: [candidacyId, "getCandidacyWithFeasibilityUploadedPdfQuery"],
    queryFn: () =>
      graphqlClient.request(getCandidacyWithFeasibilityUploadedPdfQuery, {
        candidacyId,
      }),
  });

  const candidacy = getFeasibilityResponse?.getCandidacyById;
  const feasibility = candidacy?.feasibility;

  const submitFeasibilityDecision = async (data: {
    decision: "ADMISSIBLE" | "REJECTED" | "COMPLETE" | "INCOMPLETE";
    comment: string;
    infoFile?: File;
  }) => {
    const formData = new FormData();
    formData.append("decision", data.decision);
    formData.append("comment", data.comment);
    if (data?.infoFile) {
      formData.append("infoFile", data.infoFile);
    }
    const result = await fetch(
      `${REST_API_URL}/feasibility/${feasibility?.id}/decision`,
      {
        method: "post",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );
    queryClient.invalidateQueries({
      queryKey: ["feasibilities"],
    });
    queryClient.invalidateQueries({ queryKey: [candidacyId] });
    return result;
  };

  return {
    feasibility,
    candidacy,
    submitFeasibilityDecision,
  };
};
