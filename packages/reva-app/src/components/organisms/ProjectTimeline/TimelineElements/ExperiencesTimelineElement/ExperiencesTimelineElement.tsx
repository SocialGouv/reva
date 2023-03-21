import { Button } from "@codegouvfr/react-dsfr/Button";
import { TimelineElement } from "components/molecules/Timeline/Timeline";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { Experience, duration } from "interface";
import { useMemo } from "react";
import { sortExperiences } from "utils/experienceHelpers";

export const ExperiencesTimelineElement = () => {
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
        state.context.candidacyStatus === "PROJET"
          ? selectedGoals.length
            ? sortedExperiences.length
              ? "editable"
              : "active"
            : "disabled"
          : "readonly"
      }
    >
      {({ status }) => (
        <>
          {!!sortedExperiences.length && (
            <ul
              data-test="timeline-experiences-list"
              className="mb-2 pb-2 flex flex-col space-y-3"
            >
              {sortedExperiences.map((se, i) =>
                ExperienceSummary(
                  se,
                  i,
                  ["disabled", "readonly"].includes(status)
                )
              )}
            </ul>
          )}
          <div className="text-sm text-slate-400">
            {status !== "readonly" && (
              <Button
                data-test="timeline-add-experience"
                priority="secondary"
                onClick={() => mainService.send("ADD_EXPERIENCE")}
                disabled={status === "disabled"}
              >
                Ajouter une expérience
              </Button>
            )}
          </div>
        </>
      )}
    </TimelineElement>
  );
};

const ExperienceSummary = (
  experience: Experience,
  index: number,
  disabled?: boolean
) => {
  const {
    mainService: { send },
  } = useMainMachineContext();

  return (
    <li
      key={index}
      className={`flex gap-4 p-4 border border-dsfrBlue-500 ${
        disabled ? "default" : "cursor-pointer"
      }`}
      onClick={() => !disabled && send({ type: "EDIT_EXPERIENCE", index })}
    >
      <div className="flex flex-col">
        <p data-test="timeline-experience-title" className="font-medium">
          {experience.title}
        </p>
        <p data-test="timeline-experience-duration">
          {durationToString[experience.duration]}
        </p>
      </div>
      {!disabled ? (
        <span className="fr-icon-arrow-right-s-line self-center ml-auto text-dsfrBlue-500" />
      ) : null}
    </li>
  );
};

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
