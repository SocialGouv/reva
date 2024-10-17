import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";
import { TimelineNotice } from "@/components/timeline-notice/TimelineNotice";
import { graphql } from "@/graphql/generated";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
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

  const activeStatuses = [
    "DOSSIER_FAISABILITE_RECEVABLE",
    "DOSSIER_DE_VALIDATION_SIGNALE",
  ];

  const readOnlyStatus = ["DOSSIER_DE_VALIDATION_ENVOYE"];

  const dossierSignale = candidacy.status === "DOSSIER_DE_VALIDATION_SIGNALE";

  if (activeStatuses.includes(candidacy.status)) {
    status = "active";
  }

  if (readOnlyStatus.includes(candidacy.status)) {
    status = "readonly";
  }

  let badge = undefined;
  switch (status) {
    case "readonly":
      badge = <Badge severity="success">Envoyé</Badge>;
      break;
    case "active":
      badge = <Badge severity="warning">À compléter</Badge>;
      break;
  }

  return (
    <TimelineElement
      title="Dossier de validation"
      status={status}
      badge={badge}
      data-test="dossier-de-validation-autonome-timeline-element"
      description="Ce dossier permet de justifier de vos expériences et compétences lors de votre passage devant le jury."
    >
      {status === "active" &&
        !dossierSignale &&
        !!candidacy.readyForJuryEstimatedAt && (
          <TimelineNotice
            icon="fr-icon-info-fill"
            text={`Vous avez renseigné une date de dépôt prévisionnelle, le ${format(candidacy.readyForJuryEstimatedAt, "dd/MM/yyyy")}. Assurez-vous de bien transmettre votre dossier de validation à votre certificateur.`}
          />
        )}
      {status === "active" && dossierSignale && (
        <TimelineNotice
          data-test="dossier-de-validation-signale-notice"
          icon="fr-icon-info-fill"
          text={`Le certificateur a signalé que votre dossier comportait des erreurs. Cliquez sur "Compléter" pour consulter ses remarques et le renvoyer.`}
        />
      )}

      {candidacy.status === "DOSSIER_DE_VALIDATION_ENVOYE" && (
        <TimelineNotice
          icon="fr-icon-info-fill"
          text="Votre certificateur est en train d’envoyer votre dossier. En cas d’erreur ou d’oubli, contactez-le pour pouvoir le modifier dans les plus brefs délais."
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
