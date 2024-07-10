import { format } from "date-fns";

import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidateWithCandidacy } from "@/hooks/useCandidateWithCandidacy";

export const FeasibilityAppointmentTimelineElement = () => {
  const { candidacyStatus, candidacy } = useCandidateWithCandidacy();

  if (!candidacy) {
    return null;
  }

  let status: TimeLineElementStatus = "active";
  if (candidacyStatus == "PROJET") {
    status = "disabled";
  } else if (
    candidacyStatus != "VALIDATION" &&
    candidacyStatus != "PRISE_EN_CHARGE"
  ) {
    status = "readonly";
  }

  return (
    <TimelineElement title="Étude de faisabilité" status={status}>
      <>
        {candidacy.firstAppointmentOccuredAt && candidacy.organism ? (
          status === "readonly" ? (
            <p className="text-sm text-dsfrGray-500 mb-0">
              RDV effectué le{" "}
              {format(candidacy.firstAppointmentOccuredAt, "dd/MM/yyyy")} avec{" "}
              {candidacy.organism.informationsCommerciales?.nom ??
                candidacy.organism.label}
            </p>
          ) : (
            <div className="flex text-[#0063CB] italic">
              <span className="fr-icon fr-icon-information-fill mr-2 self-center" />
              <div>
                <p className="text-sm mb-0">
                  Votre rendez-vous pédagogique est prévu le
                  <strong>
                    {" "}
                    {format(
                      candidacy.firstAppointmentOccuredAt,
                      "dd/MM/yyyy",
                    )}{" "}
                    avec{" "}
                    {candidacy.organism.informationsCommerciales?.nom ??
                      candidacy.organism.label}
                    .
                  </strong>
                </p>
                <p className="text-sm mb-0">
                  Vous avez jusqu’à cette date pour modifier votre candidature.
                  Au-delà de cette date, votre candidature ne sera plus
                  modifiable.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="flex text-dsfrGray-500 italic">
            <span className="fr-icon  fr-icon-time-fill mr-2 self-center" />
            <p className="text-sm mb-0">
              Votre organisme accompagnateur va bientôt vous contacter pour
              organiser avec vous votre premier rendez-vous pédagogique.
            </p>
          </div>
        )}
      </>
    </TimelineElement>
  );
};
