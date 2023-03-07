import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { Experience, duration } from "interface";
import { useMemo } from "react";
import { sortExperiences } from "utils/experienceHelpers";

export const ExperiencesTimelineElement = ({
  readonly,
}: {
  readonly?: boolean;
}) => {
  const { state, mainService } = useMainMachineContext();

  const selectedGoals = useMemo(
    () => state.context.goals.filter((goal) => goal.checked),
    [state.context.goals]
  );

  const sortedExperiences = useMemo(
    () => sortExperiences(state.context.experiences),
    [state.context.experiences]
  );

  return (
    <TimelineElement
      title="Vos expériences"
      status={
        selectedGoals.length
          ? sortedExperiences.length
            ? "editable"
            : "active"
          : "disabled"
      }
    >
      {({ status }) => (
        <>
          {!!sortedExperiences.length && (
            <ul
              data-test="project-home-experiences"
              className="mb-2 pb-2 flex flex-col space-y-3"
            >
              {sortedExperiences.map(ExperienceSummary)}
            </ul>
          )}
          <div className="text-sm text-slate-400">
            {!readonly && (
              <Button
                data-test="project-home-edit-experiences"
                priority="secondary"
                onClick={() => mainService.send("EDIT_EXPERIENCES")}
                disabled={status === "disabled"}
              >
                {sortedExperiences.length
                  ? "Modifier vos expériences"
                  : "Choisir vos expériences"}
              </Button>
            )}
          </div>
        </>
      )}
    </TimelineElement>
  );
};

const ExperienceSummary = (experience: Experience, index: number) => (
  <li key={index} className="flex flex-col p-4 border border-dsfrBlue-500">
    <p data-test="project-home-experience-title" className="font-medium">
      {experience.title}
    </p>
    <p data-test="project-home-experience-duration">
      {durationToString[experience.duration]}
    </p>
  </li>
);

const durationToString: {
  [key in duration]: string;
} = {
  unknown: "Durée inconnue",
  lessThanOneYear: "Moins d'un an",
  betweenOneAndThreeYears: "Entre 1 et 3 ans",
  moreThanThreeYears: "Plus de 3 ans",
  moreThanFiveYears: "Plus de 5 ans",
  moreThanTenYears: "Plus de 10 ans",
};
