import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";

import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { FundingCallOut } from "../../../../../../funding-call-out/FundingCallOut";
// import Badge from "@codegouvfr/react-dsfr/Badge";

export const CertificationTimelineElement = () => {
  const router = useRouter();

  const { canEditCandidacy, candidacy } = useCandidacy();

  const { certification } = candidacy;

  let status: TimeLineElementStatus = "active";
  if (!canEditCandidacy) {
    status = "readonly";
  } else if (certification) {
    status = "editable";
  }

  const candidacyStatus = candidacy.status;

  const showFundingCallOut =
    candidacy.financeModule === "hors_plateforme" &&
    candidacy.typeAccompagnement === "ACCOMPAGNE" &&
    candidacyStatus === "PROJET";

  return (
    <TimelineElement
      title="Choix du diplôme"
      status={status}
      // badge={
      //   certification ? (
      //     <Badge
      //       severity="success"
      //       data-test="certification-timeline-element-badge"
      //     >
      //       Complété
      //     </Badge>
      //   ) : (
      //     <Badge
      //       severity="warning"
      //       data-test="certification-timeline-element-badge"
      //     >
      //       À compléter
      //     </Badge>
      //   )
      // }
    >
      <div className="flex flex-col md:flex-row basis-1/2 gap-6 ">
        <div className="flex flex-col w-full">
          {certification && (
            <div className="border p-6">
              <p
                className="text-dsfrGray-500 italic text-xs mb-4"
                data-test="timeline-certification-code-rncp"
              >
                Code RNCP : {certification.codeRncp}
              </p>
              <h4 data-test="certification-label" className="mb-6 text-xl">
                {certification.label}
              </h4>
              <a
                href={`https://www.francecompetences.fr/recherche/rncp/${certification.codeRncp}/`}
                target="_blank"
                className="text-dsfrBlue-500"
                data-test="timeline-certification-more-info-link"
              >
                Lire les détails de la fiche diplôme
              </a>
            </div>
          )}

          {status !== "readonly" && (
            <Button
              data-test="project-home-set-certification"
              priority="secondary"
              onClick={() => {
                router.push("set-certification");
              }}
            >
              {certification
                ? "Modifiez votre diplôme"
                : "Choisir votre diplôme"}
            </Button>
          )}
        </div>
        {showFundingCallOut && (
          <FundingCallOut className="basis-1/2 ml-auto mr-6 md:mr-0" />
        )}
      </div>
    </TimelineElement>
  );
};
