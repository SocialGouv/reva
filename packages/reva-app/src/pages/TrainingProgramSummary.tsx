import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useActor } from "@xstate/react";
import { BackToHomeButton } from "components/molecules/BackToHomeButton/BackToHomeButton";
import { ReactNode, useReducer } from "react";
import { Interpreter } from "xstate";

import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

type PageAction = {
  type: "changeCondition";
  payload: {
    condition:
      | "conditionOne"
      | "conditionTwo"
      | "conditionThree"
      | "conditionFour";
    checked: boolean;
  };
};

interface PageState {
  conditionOneChecked: boolean;
  conditionTwoChecked: boolean;
  conditionThreeChecked: boolean;
  conditionFourChecked: boolean;
  allConditionsChecked: boolean;
}

const pageReducer = (state: PageState, action: PageAction) => {
  const newState = { ...state };
  switch (action.type) {
    case "changeCondition": {
      switch (action.payload.condition) {
        case "conditionOne":
          newState.conditionOneChecked = action.payload.checked;
          break;
        case "conditionTwo":
          newState.conditionTwoChecked = action.payload.checked;
          break;
        case "conditionThree":
          newState.conditionThreeChecked = action.payload.checked;
          break;
        case "conditionFour":
          newState.conditionFourChecked = action.payload.checked;
          break;
      }
      newState.allConditionsChecked =
        newState.conditionOneChecked &&
        newState.conditionTwoChecked &&
        newState.conditionThreeChecked &&
        newState.conditionFourChecked;
    }
  }
  return newState;
};

export const TrainingProgramSummary = ({
  mainService,
}: {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}) => {
  const [state, send] = useActor(mainService);
  const isTrainingConfirmed = state.context.isTrainingProgramConfirmed;

  const [pageState, pageDispatch] = useReducer(pageReducer, {
    conditionOneChecked: false,
    conditionTwoChecked: false,
    conditionThreeChecked: false,
    conditionFourChecked: false,
    allConditionsChecked: false,
  });

  if (!state.context.trainingProgram) return <></>;

  const {
    trainingProgram: {
      additionalHourCount,
      basicSkills,
      certificateSkills,
      collectiveHourCount,
      individualHourCount,
      mandatoryTrainings,
      otherTraining,
    },
    isCertificationPartial,
  } = state.context;

  return (
    <Page title="votre parcours" direction={state.context.direction}>
      <BackToHomeButton />
      <h1 className="mt-4 text-3xl font-bold">
        {isTrainingConfirmed ? "Votre parcours" : "Valider votre parcours"}
      </h1>

      <p className="text-dsfrGray-800 mt-6">
        Suite à votre rendez-vous de faisabilité avec votre Architecte de
        Parcours, veuillez valider la proposition de parcours suivante :
      </p>

      <ul
        className="mt-6 text-dsfrGray-700 list-square list-inside"
        data-test="general-informations"
      >
        {isCertificationPartial ? (
          <li>Certification visée partiellement</li>
        ) : null}
        <li>Accompagnement individuel: {individualHourCount || 0}h</li>
        <li>Accompagnement collectif: {collectiveHourCount || 0}h</li>
        <li>Formation: {additionalHourCount || 0}h</li>
      </ul>

      {mandatoryTrainings?.length ? (
        <TrainingSection
          title="Formations obligatoires"
          data-test="mandatory-training-section"
        >
          <ul className="list-square list-inside">
            {mandatoryTrainings.map((mt) => (
              <li key={mt} className="text-dsfrGray-800">
                {mt}
              </li>
            ))}
          </ul>
        </TrainingSection>
      ) : null}

      {basicSkills?.length ? (
        <TrainingSection
          title="Savoirs de base"
          data-test="basic-skills-section"
        >
          <ul className="list-square list-inside">
            {basicSkills.map((mt) => (
              <li key={mt} className="text-dsfrGray-800">
                {mt}
              </li>
            ))}
          </ul>
        </TrainingSection>
      ) : null}

      {certificateSkills && (
        <TrainingSection
          title="Bloc de compétences métiers"
          data-test="certificate-skills-section"
        >
          <p>{certificateSkills}</p>
        </TrainingSection>
      )}

      {otherTraining && (
        <TrainingSection title="Autre" data-test="other-training-section">
          <p>{otherTraining}</p>
        </TrainingSection>
      )}

      <Checkbox
        data-test="accept-conditions-checkbox-group"
        className="mt-10"
        legend="Conditions générales"
        options={[
          {
            label:
              "J’ai bien compris qu’il s’agissait des étapes et prestations nécessaires pour que j’obtienne mon diplôme",
            nativeInputProps: {
              disabled: isTrainingConfirmed,
              defaultChecked: isTrainingConfirmed,
              onChange: (e) =>
                pageDispatch({
                  type: "changeCondition",
                  payload: {
                    condition: "conditionOne",
                    checked: e.target.checked,
                  },
                }),
            },
          },
          {
            label:
              "Je m’engage à suivre ce parcours ou informer mon accompagnateur de tout abandon dans les 48h",
            nativeInputProps: {
              disabled: isTrainingConfirmed,
              defaultChecked: isTrainingConfirmed,
              onChange: (e) =>
                pageDispatch({
                  type: "changeCondition",
                  payload: {
                    condition: "conditionTwo",
                    checked: e.target.checked,
                  },
                }),
            },
          },
          {
            label:
              "J’ai bien compris que mon accord allait déclencher une demande de prise en charge financière de mon parcours",
            nativeInputProps: {
              disabled: isTrainingConfirmed,
              defaultChecked: isTrainingConfirmed,
              onChange: (e) =>
                pageDispatch({
                  type: "changeCondition",
                  payload: {
                    condition: "conditionThree",
                    checked: e.target.checked,
                  },
                }),
            },
          },
          {
            label:
              "J’accepte que les résultats de mon étude personnalisée ainsi que les résultats de ma session de jury me soient transmis ainsi qu’à mon accompagnateur.",
            nativeInputProps: {
              disabled: isTrainingConfirmed,
              defaultChecked: isTrainingConfirmed,
              onChange: (e) =>
                pageDispatch({
                  type: "changeCondition",
                  payload: {
                    condition: "conditionFour",
                    checked: e.target.checked,
                  },
                }),
            },
          },
        ]}
      />

      {!isTrainingConfirmed && (
        <Button
          data-test="submit-training-program-button"
          className="mt-6 justify-center w-[100%]  md:w-fit"
          nativeButtonProps={{ onClick: () => send("SUBMIT_TRAINING_PROGRAM") }}
          disabled={!pageState.allConditionsChecked}
        >
          Valider votre parcours
        </Button>
      )}

      {state.context.error ? (
        <p key="error" className="text-red-600 mt-4 text-sm">
          {state.context.error}
        </p>
      ) : (
        <></>
      )}
    </Page>
  );
};

const TrainingSection = ({
  title,
  children,
  "data-test": dataTest,
}: {
  title: string;
  children?: ReactNode;
  "data-test"?: string;
}) => (
  <section className="text-dsfrGray-800 mt-4" data-test={dataTest}>
    <h2 className="text-dsfrGray-800 text-lg font-bold mb-3">{title} :</h2>
    {children}
  </section>
);
