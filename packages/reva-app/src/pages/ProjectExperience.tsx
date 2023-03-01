import { Capacitor } from "@capacitor/core";
import { useActor } from "@xstate/react";
import { useRef } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { Select } from "../components/atoms/Select";
import { Textarea } from "../components/atoms/Textarea";
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
  const descriptionRef = useRef<HTMLDivElement>(null);

  return (
    <Page
      className="z-[90] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton />
      <div className="h-full flex flex-col px-12 overflow-y-auto pb-[400px]">
        <form onSubmit={onSubmit} className="mt-4 space-y-6">
          <Input
            name="title"
            label="Intitulé du poste"
            required={true}
            defaultValue={editedExperience?.title}
          />
          <Input
            name="startedAt"
            label="Date de début"
            type="date"
            defaultValue={
              editedExperience
                ? editedExperience.startedAt.toISOString().slice(0, -14)
                : "2020-01-31"
            }
          />
          <Select
            label="Combien de temps"
            name="duration"
            options={durationOptions}
            defaultValue={editedExperience?.duration}
          />
          <Textarea
            ref={descriptionRef}
            name="description"
            label="Description du poste"
            onFocus={
              Capacitor.getPlatform() === "android"
                ? () => descriptionRef.current?.scrollIntoView()
                : () => {}
            }
            rows={5}
            defaultValue={editedExperience?.description}
          />
          {state.matches("projectExperience.error") && (
            <p className="text-red-600 my-4 text-sm">{state.context.error}</p>
          )}
          <Button
            data-test={`project-experience-${
              editedExperience ? "save" : "add"
            }`}
            type="submit"
            loading={state.matches("projectExperience.submitting")}
            label={editedExperience ? "Valider" : "Ajouter"}
            size="small"
          />
        </form>
      </div>
    </Page>
  );
};
