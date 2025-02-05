import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { TimelineElement } from "@/components/legacy/molecules/Timeline/Timeline";
import { graphql } from "@/graphql/generated";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useGetDossierDeValidationTimelineInfo } from "./useGetDossierDeValidationTimeline";

const getCandidateQuery = graphql(`
  query getCandidateWithCandidacyForDossierDeValidationTimelineElement {
    candidate_getCandidateWithCandidacy {
      id
      candidacy {
        id
        readyForJuryEstimatedAt
        status
        isCaduque
      }
    }
  }
`);

export const DossierDeValidationTimelineElement = () => {
  const router = useRouter();
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidateResponse } = useQuery({
    queryKey: [
      "candidate",
      "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
    ],
    queryFn: () => graphqlClient.request(getCandidateQuery),
  });

  const candidacy =
    getCandidateResponse?.candidate_getCandidateWithCandidacy?.candidacy;
  const isCaduque = candidacy?.isCaduque;

  const { status, badge, notice } = useGetDossierDeValidationTimelineInfo();

  if (!candidacy) {
    return null;
  }

  return (
    <TimelineElement
      title="Dossier de validation"
      status={status}
      badge={badge}
      data-test="dossier-de-validation-timeline-element"
      description="Ce dossier permet de justifier de vos expériences et compétences lors de votre passage devant le jury."
    >
      {notice}
      {!isCaduque && (
        <Button
          data-test="dossier-de-validation-timeline-element-update-button"
          priority={status === "active" ? "primary" : "secondary"}
          disabled={status === "disabled"}
          onClick={() => {
            router.push("/dossier-de-validation");
          }}
        >
          {status === "readonly" ? "Consulter" : "Compléter"}
        </Button>
      )}
    </TimelineElement>
  );
};
