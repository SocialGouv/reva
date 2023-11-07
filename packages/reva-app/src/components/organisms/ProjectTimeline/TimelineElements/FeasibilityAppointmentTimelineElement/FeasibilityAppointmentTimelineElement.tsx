import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { format } from "date-fns";

export const FeasibilityAppointmentTimelineElement = () => {
  const { state } = useMainMachineContext();

  const status = ["VALIDATION", "PRISE_EN_CHARGE"].includes(
    state.context.candidacyStatus
  )
    ? "active"
    : state.context.candidacyStatus === "PROJET"
    ? "disabled"
    : "readonly";

  return (
    <TimelineElement title="Étude de faisabilité" status={status}>
      {({ status }) =>
        state.context.firstAppointmentOccuredAt && state.context.organism ? (
          status === "readonly" ? (
            <p className="text-sm text-dsfrGray-500">
              RDV effectué le{" "}
              {format(state.context.firstAppointmentOccuredAt, "dd/MM/yyyy")}{" "}
              avec {state.context.organism?.label}
            </p>
          ) : (
            <div className="flex text-[#0063CB] italic">
              <span className="fr-icon fr-icon-information-fill mr-2 self-center" />
              <div>
                <p className="text-sm">
                  Votre rendez-vous pédagogique est prévu le
                  <strong>
                    {" "}
                    {format(
                      state.context.firstAppointmentOccuredAt,
                      "dd/MM/yyyy"
                    )}{" "}
                    avec {state.context.organism?.label}.
                  </strong>
                </p>
                <p className="text-sm">
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
            <p className="text-sm">
              Votre organisme accompagnateur va bientôt vous contacter pour
              organiser avec vous votre premier rendez-vous pédagogique.
            </p>
          </div>
        )
      }
    </TimelineElement>
  );
};
