import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";
import { graphql } from "@/graphql/generated";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
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
          <Notice
            title={
              <>
                <span className="inline text-sm text-dsfrGray-500 italic font-normal">
                  Vous avez renseigné une date de dépôt prévisionnelle, le{" "}
                  {format(candidacy.readyForJuryEstimatedAt, "dd/MM/yyyy")}.
                </span>
                <span className="block md:ml-8 text-sm text-dsfrGray-500 italic font-normal">
                  Assurez-vous de bien transmettre votre dossier de validation à
                  votre certificateur.
                </span>
              </>
            }
            className="pt-0 bg-transparent  [&_.fr-container]:pl-0"
            classes={{ title: "text-dsfrGray-500" }}
          />
        )}
      {status === "active" && dossierSignale && (
        <Notice
          data-test="dossier-de-validation-signale-notice"
          title="Selon le certificateur, votre dossier est incomplet. Cliquez sur
                “Compléter” pour consulter ses remarques et rajouter le ou les
                élements manquants avant de renvoyer votre dossier de
                validation."
          className="pt-0 bg-transparent  [&_.fr-container]:pl-0"
          classes={{
            title: "inline text-sm text-dsfrGray-500 italic font-normal",
          }}
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
