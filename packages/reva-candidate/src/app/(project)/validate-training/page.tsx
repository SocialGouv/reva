"use client";

import { ChangeEvent, useReducer } from "react";
import { useRouter } from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

import { PageLayout } from "@/layouts/page.layout";

import { useValidateTraining } from "./validate-training.hooks";
import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { graphqlErrorToast } from "@/components/toast/toast";
import { GraphQLError } from "graphql";

type Condition =
  | "conditionOne"
  | "conditionTwo"
  | "conditionThree"
  | "conditionFour"
  | "conditionFive";

type PageAction = {
  type: "changeCondition";
  payload: {
    condition: Condition;
    checked: boolean;
  };
};

interface PageState {
  conditionOneChecked: boolean;
  conditionTwoChecked: boolean;
  conditionThreeChecked: boolean;
  conditionFourChecked: boolean;
  conditionFiveChecked: boolean;
  allConditionsChecked: boolean;
  candidacyFundedByFranceVae: boolean;
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
        case "conditionFive":
          newState.conditionFiveChecked = action.payload.checked;
          break;
      }
      newState.allConditionsChecked = newState.candidacyFundedByFranceVae
        ? newState.conditionOneChecked &&
          newState.conditionTwoChecked &&
          newState.conditionThreeChecked &&
          newState.conditionFourChecked &&
          newState.conditionFiveChecked
        : newState.conditionOneChecked &&
          newState.conditionTwoChecked &&
          newState.conditionFourChecked &&
          newState.conditionFiveChecked;
    }
  }
  console.log(newState);
  return newState;
};

export default function ValidateTraining() {
  const router = useRouter();

  const { candidacy, refetch, isTrainingConfirmed } = useCandidacy();

  const { confirmTrainingForm } = useValidateTraining();

  const [pageState, pageDispatch] = useReducer(pageReducer, {
    conditionOneChecked: false,
    conditionTwoChecked: false,
    conditionThreeChecked: false,
    conditionFourChecked: false,
    conditionFiveChecked: false,
    allConditionsChecked: false,
    candidacyFundedByFranceVae: candidacy.financeModule !== "hors_plateforme",
  });

  const {
    additionalHourCount,
    basicSkills,
    certificateSkills,
    collectiveHourCount,
    individualHourCount,
    mandatoryTrainings,
    otherTraining,
  } = candidacy;

  const onSubmit = async () => {
    try {
      const response = await confirmTrainingForm.mutateAsync({
        candidacyId: candidacy.id,
      });
      if (response) {
        refetch();
        router.push("/");
      }
    } catch (error) {
      graphqlErrorToast(error as GraphQLError);
    }
  };

  const checkboxOption = ({
    title,
    condition,
  }: {
    title: string;
    condition: Condition;
  }) => ({
    label: title,
    nativeInputProps: {
      checked: pageState[`${condition}Checked`],
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.checked);
        pageDispatch({
          type: "changeCondition",
          payload: {
            condition,
            checked: e.target.checked,
          },
        });
      },
    },
  });

  const trainingOptions: { title: string; condition: Condition }[] = [
    {
      title:
        "J’ai bien compris qu’il s’agissait des étapes et prestations nécessaires pour atteindre mon objectif de diplôme",
      condition: "conditionOne",
    },
    {
      title:
        "Je m’engage à suivre ce parcours ou informer mon organisme d’accompagnement de tout abandon dans les 48h",
      condition: "conditionTwo",
    },
    ...(candidacy.financeModule !== "hors_plateforme"
      ? [
          {
            title:
              "J’ai bien compris que mon accord allait déclencher une demande de prise en charge financière de mon parcours",
            condition: "conditionThree" as Condition,
          },
        ]
      : []),
    {
      title:
        "J’accepte que les résultats de mon étude personnalisée ainsi que les résultats de ma session de jury me soient transmis ainsi qu’à mon accompagnateur.",
      condition: "conditionFour",
    },
    {
      title:
        "Je certifie que je ne prépare pas ce diplôme en formation initiale durant l’année de mon parcours VAE.",
      condition: "conditionFive",
    },
  ];

  const TrainingValidationForm = () => (
    <>
      <Checkbox
        data-test="accept-conditions-checkbox-group"
        className="mt-10"
        legend="Conditions générales"
        options={trainingOptions.map((option) => checkboxOption(option))}
      />
      <Button
        data-test="submit-training-program-button"
        className="mt-6 justify-center w-[100%]  md:w-fit"
        nativeButtonProps={{
          onClick: onSubmit,
        }}
        disabled={!pageState.allConditionsChecked}
      >
        Valider votre parcours
      </Button>
    </>
  );

  return (
    <PageLayout className="max-w-2xl" title="Votre parcours" displayBackToHome>
      <h2 className="mt-6 mb-4">
        {isTrainingConfirmed ? "Votre parcours" : "Valider votre parcours"}
      </h2>
      <p>
        Suite à votre rendez-vous de faisabilité avec votre Architecte de
        Parcours, veuillez valider la proposition de parcours suivante :
      </p>
      <ul
        className="text-dsfrGray-700 list-square list-inside"
        data-test="general-informations"
      >
        {candidacy.isCertificationPartial ? (
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
              <li key={mt.id} className="text-dsfrGray-800">
                {mt.label}
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
              <li key={mt.id} className="text-dsfrGray-800">
                {mt.label}
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

      {!isTrainingConfirmed && <TrainingValidationForm />}
    </PageLayout>
  );
}

const TrainingSection = ({
  title,
  children,
  "data-test": dataTest,
}: {
  title: string;
  children?: React.ReactNode;
  "data-test"?: string;
}) => (
  <section className="text-dsfrGray-800 mt-4" data-test={dataTest}>
    <h2 className="text-dsfrGray-800 text-lg font-bold mb-3">{title} :</h2>
    {children}
  </section>
);
