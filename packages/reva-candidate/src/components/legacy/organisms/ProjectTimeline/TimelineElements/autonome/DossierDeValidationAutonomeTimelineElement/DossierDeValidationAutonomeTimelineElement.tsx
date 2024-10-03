import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";
import { graphql } from "@/graphql/generated";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const getCandidateQuery = graphql(`
  query getCandidateWithCandidacyForDossierDeValidationAutonomeTimelineElement {
    candidate_getCandidateWithCandidacy {
      id
      candidacy {
        id
        readyForJuryEstimatedAt
        status
      }
    }
  }
`);

export const DossierDeValidationAutonomeTimelineElement = () => {
  const router = useRouter();
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidateResponse } = useQuery({
    queryKey: [
      "candidate",
      "getCandidateWithCandidacyForDossierDeValidationAutonomeTimelineElement",
    ],
    queryFn: () => graphqlClient.request(getCandidateQuery),
  });

  const candidacy =
    getCandidateResponse?.candidate_getCandidateWithCandidacy?.candidacy;

  if (!candidacy) {
    return null;
  }

  let status: TimeLineElementStatus = "disabled";

  const activeStatuses = ["DOSSIER_FAISABILITE_RECEVABLE"];

  const readOnlyStatus = ["DOSSIER_DE_VALIDATION_ENVOYE"];

  if (activeStatuses.includes(candidacy.status)) {
    status = "active";
  }

  if (readOnlyStatus.includes(candidacy.status)) {
    status = "readonly";
  }

  return (
    <TimelineElement
      title="Dossier de validation"
      status={status}
      data-test="dossier-de-validation-autonome-timeline-element"
      description="Ce dossier permet de justifier de vos expériences et compétences lors de votre passage devant le jury."
    >
      {status === "active" && !!candidacy.readyForJuryEstimatedAt && (
        <Notice
          title={
            <span className=" text-dsfrGray-500 italic font-normal">
              <p className="inline text-sm">
                Vous avez renseigné une date de dépôt prévisionnelle, le{" "}
                {format(candidacy.readyForJuryEstimatedAt, "dd/MM/yyyy")}.
              </p>
              <p className="ml-8 text-sm">
                Assurez-vous de bien transmettre votre dossier de validation à
                votre certificateur.
              </p>
            </span>
          }
          className="pt-0 bg-transparent  [&_.fr-container]:pl-0"
          classes={{ title: "text-dsfrGray-500" }}
        />
      )}
      {candidacy.status === "DOSSIER_DE_VALIDATION_ENVOYE" && (
        <Notice
          title="Votre certificateur est en train d’étudier votre dossier. En cas d’erreur ou d’oubli, contactez-le pour pouvoir le modifier dans les plus brefs délais. Si votre dossier est bon, vous recevrez prochainement une convocation pour le jury. S’il est considéré comme incomplet, vous devrez le modifier et le renvoyer. "
          className="pt-0 bg-transparent  [&_.fr-container]:pl-0"
          classes={{ title: "text-dsfrGray-500 italic font-normal text-sm" }}
        />
      )}

      <Button
        data-test="dossier-de-validation-autonome-timeline-element-update-button"
        priority={status === "active" ? "primary" : "secondary"}
        disabled={status === "disabled"}
        onClick={() => {
          router.push("/dossier-de-validation-autonome");
        }}
      >
        {status === "readonly" ? "Consulter" : "Compléter"}
      </Button>
    </TimelineElement>
  );
};
