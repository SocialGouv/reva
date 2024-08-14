import { format } from "date-fns";

import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { FundingCallOut } from "../../../../../funding-call-out/FundingCallOut";

export const FeasibilityAppointmentTimelineElement = () => {
  const { candidacyStatus, candidacy } = useCandidacy();

  let status: TimeLineElementStatus = "active";
  if (candidacyStatus == "PROJET") {
    status = "disabled";
  } else if (
    candidacyStatus != "VALIDATION" &&
    candidacyStatus != "PRISE_EN_CHARGE"
  ) {
    status = "readonly";
  }

  const { isFeatureActive } = useFeatureFlipping();
  const affichageTypesFinancementCandidatureFeatureActive = isFeatureActive(
    "AFFICHAGE_TYPES_FINANCEMENT_CANDIDATURE",
  );

  const showFundingCallOut =
    affichageTypesFinancementCandidatureFeatureActive &&
    candidacyStatus !== "PROJET";

  return (
    <TimelineElement title="Étude de faisabilité" status={status}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col basis-1/2">
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
                    Vous avez jusqu’à cette date pour modifier votre
                    candidature. Au-delà de cette date, votre candidature ne
                    sera plus modifiable.
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
        </div>
        {showFundingCallOut && (
          <FundingCallOut className="basis-1/2 ml-auto mr-6 md:mr-0" />
        )}
      </div>
    </TimelineElement>
  );
};
