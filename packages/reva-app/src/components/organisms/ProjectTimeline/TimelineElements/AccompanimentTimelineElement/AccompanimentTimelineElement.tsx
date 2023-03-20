import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { candidacyStatus } from "interface";
import { useMemo } from "react";

export const AccompanimentTimelineElement = () => {
  const { state } = useMainMachineContext();

  const isAccompanimentInWaiting = useMemo(() => {
    const waitingStatus: candidacyStatus[] = [
      "PROJET",
      "VALIDATION",
      "PRISE_EN_CHARGE",
      "PARCOURS_ENVOYE",
    ];
    return waitingStatus.includes(state.context.candidacyStatus);
  }, [state.context.candidacyStatus]);

  return (
    <TimelineElement
      title="Accompagnement"
      status={isAccompanimentInWaiting ? "disabled" : "active"}
    >
      {({ status }) => (
        <p>Statut: {status === "active" ? "en cours" : "en attente"}</p>
      )}
    </TimelineElement>
  );
};
