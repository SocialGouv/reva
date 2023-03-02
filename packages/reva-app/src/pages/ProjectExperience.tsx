import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { Experience, duration } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface ProjectExperienceProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

interface FormElements extends HTMLFormControlsCollection {
  title: HTMLInputElement;
  startedAt: HTMLInputElement;
  duration: HTMLSelectElement;
  description: HTMLTextAreaElement;
}

interface ExperienceFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const durationOptions: { label: string; value: duration }[] = [
  { label: "Moins d'un an", value: "lessThanOneYear" },
  { label: "Entre 1 et 3 ans", value: "betweenOneAndThreeYears" },
  { label: "Plus de 3 ans", value: "moreThanThreeYears" },
  { label: "Plus de 5 ans", value: "moreThanFiveYears" },
  { label: "Plus de 10 ans", value: "moreThanTenYears" },
];

export const ProjectExperience = ({ mainService }: ProjectExperienceProps) => {
  const [state, send] = useActor(mainService);

  const onSubmit = (event: React.SyntheticEvent<ExperienceFormElement>) => {
    event.preventDefault();
    const elements = event.currentTarget.elements;
    const experience: Experience = {
      id: state.context.experiences.edited?.id,
      title: elements.title.value,
      startedAt: new Date(elements.startedAt.value),
      description: elements.description.value,
      duration: elements.duration.value as duration,
    };
    send({
      type: "SUBMIT_EXPERIENCE",
      experience,
    });
  };

  const editedExperience = state.context.experiences.edited;

  return (
    <Page
      className="z-[90] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton />
      <div className="h-full flex flex-col px-12 overflow-y-auto pb-[400px]">
        <h1 className="mb-4 text-3xl font-bold text-black">
          Nouvelle expérience
        </h1>
        <p className="text-xs text-dsfrGray-500">
          Il peut s’agir d’une expérience professionnelle, bénévole, d’un stage
          ou d’une activité extra-professionnelle.
        </p>
        <form onSubmit={onSubmit} className="mt-4 space-y-6">
          <Input
            label="Intitulé du poste"
            nativeInputProps={{
              name: "title",
              required: true,
              defaultValue: editedExperience?.title,
            }}
          />
          <Input
            label="Date de début"
            nativeInputProps={{
              name: "startedAt",
              defaultValue: editedExperience
                ? editedExperience.startedAt.toISOString().slice(0, -14)
                : "2020-01-31",
              type: "date",
            }}
          />
          <label htmlFor="duration" className="fr-label">
            Pendant combien de temps avez-vous exercé cette activité ?
          </label>
          <RadioButtons
            name="duration"
            options={durationOptions.map((o) => ({
              label: o.label,
              nativeInputProps: {
                value: o.value,
                defaultChecked: editedExperience?.duration === o.value,
                "data-test": `duration-${o.value}`,
              },
            }))}
          />

          <Input
            textArea
            label="Description du poste"
            nativeTextAreaProps={{
              name: "description",
              defaultValue: editedExperience?.description,
              rows: 5,
            }}
          />
          {state.matches("projectExperience.error") && (
            <p className="text-red-600 my-4 text-sm">{state.context.error}</p>
          )}

          <Button
            className="mt-6 justify-center w-[100%]  md:w-min"
            data-test={`project-experience-${
              editedExperience ? "save" : "add"
            }`}
          >
            {editedExperience ? "Valider" : "Ajouter"}
          </Button>
        </form>
      </div>
    </Page>
  );
};
