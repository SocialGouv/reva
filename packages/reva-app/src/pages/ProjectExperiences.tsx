import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Add, Edit } from "../components/atoms/Icons";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { Experience, duration } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";
import { sortExperiences } from "../utils/experienceHelpers";

interface ProjectExperiencesProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

const durationToString: {
  [key in duration]: string;
} = {
  unknown: "inconnue",
  lessThanOneYear: "de moins d'un an",
  betweenOneAndThreeYears: "comprise entre 1 et 3 ans",
  moreThanThreeYears: "de plus de 3 ans",
  moreThanFiveYears: "de plus de 5 ans",
  moreThanTenYears: "de plus de 10 ans",
};

const ExperiencePreview = (
  experience: Experience,
  index: number,
  save: () => void
) => (
  <li
    key={`experience-${index}`}
    className="text-slate-800 rounded-lg bg-gray-100 h-64 py-2 px-8 space-y-4"
  >
    <div className="w-full flex items-center justify-between">
      <Title data-test="project-experience-title" label={experience.title} />
      <button
        data-test={`project-experiences-edit-${index}`}
        type="button"
        onClick={save}
        className="-mr-2 cursor-pointer pt-3 shrink-0 w-[24px]"
      >
        <Edit />
        <span className="sr-only">Modifier</span>
      </button>
    </div>
    <p data-test="project-experience-start-date">
      {`Démarrée en ${experience.startDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      })}`}
    </p>
    <p data-test="project-experience-duration" className="font-semibold">
      {`Durée d'expérience ${durationToString[experience.duration]}`}
    </p>
    <p data-test="project-experience-description" className="italic">
      "{experience.description}"
    </p>
  </li>
);

export const ProjectExperiences = ({
  mainService,
}: ProjectExperiencesProps) => {
  const [state, send] = useActor(mainService);

  return (
    <Page
      className="z-[70] h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="mt-2 grow overflow-y-auto w-full space-y-3 px-8">
        <Title size="small" label="Mes experiences professionnelles" />
        <ul data-test="project-experiences-overview" className="space-y-3">
          {sortExperiences(state.context.experiences).map((exp, index) =>
            ExperiencePreview(exp, index, () =>
              send({ type: "EDIT_EXPERIENCE", index })
            )
          )}
        </ul>
        <div
          onClick={() => send("ADD_EXPERIENCE")}
          className="mb-8 cursor-pointer flex items-center justify-center border rounded-lg border-dashed border-gray-300 p-4"
        >
          <button
            data-test="project-experiences-add"
            type="button"
            className="rounded-full h-[46px] w-[46px] bg-gray-100 p-[14px]"
          >
            <Add />
            <span className="sr-only">Ajouter</span>
          </button>
        </div>
      </div>
      <div className="bg-white flex justify-center pt-6 pb-12">
        <Button
          data-test="project-experiences-submit"
          onClick={() => send("SUBMIT_EXPERIENCES")}
          type="submit"
          label="Valider"
          size="medium"
        />
      </div>
    </Page>
  );
};
