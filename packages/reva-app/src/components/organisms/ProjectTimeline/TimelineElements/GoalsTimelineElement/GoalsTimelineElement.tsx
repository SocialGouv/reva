import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useProjectTimeline } from "components/organisms/ProjectTimeline/ProjectTimeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { useMemo } from "react";

export const GoalsTimelineElement = () => {
  const { state, mainService } = useMainMachineContext();
  const { getTimelineElementStatus } = useProjectTimeline();

  const selectedGoals = useMemo(
    () => state.context.goals.filter((goal) => goal.checked),
    [state.context.goals]
  );

  return (
    <TimelineElement
      title="Vos objectifs"
      status={getTimelineElementStatus({
        previousElementFilled: !!state.context.certification,
        currentElementFilled: !!selectedGoals.length,
      })}
    >
      {({ status }) => (
        <>
          <ul className="mt-0 mb-2 leading-tight">
            {selectedGoals.map((goal) => (
              <li className="mb-2" key={goal.id}>
                {goal.label}
              </li>
            ))}
          </ul>
          {status !== "readonly" && (
            <Button
              data-test="project-home-edit-goals"
              priority="secondary"
              onClick={() => mainService.send("EDIT_GOALS")}
              disabled={status === "disabled"}
            >
              {selectedGoals.length > 0
                ? "Modifiez vos objectifs"
                : "Choisir vos objectifs"}
            </Button>
          )}
        </>
      )}
    </TimelineElement>
  );
};
