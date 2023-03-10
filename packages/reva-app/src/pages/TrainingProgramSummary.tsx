import { useActor } from "@xstate/react";
import { FC, useState } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { CardBasic } from "../components/atoms/CardBasic";
import { Checkbox } from "../components/atoms/Checkbox";
import { Description } from "../components/atoms/Description";
import { BackButton } from "../components/molecules/BackButton";
import { DescriptionMultiLine } from "../components/molecules/DescriptionMultiLine";
import { DescriptionSimple } from "../components/molecules/DescriptionSimple";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface Props {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const TrainingProgramSummary: FC<Props> = ({ mainService }) => {
  const [state, send] = useActor(mainService);
  const [checkedCondition, setCheckedCondition] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const isTrainingConfirmed = state.context.isTrainingProgramConfirmed;

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
    certification,
    isCertificationPartial,
  } = state.context;

  return (
    <Page
      className="bg-slate-900 !max-w-none h-full "
      direction={state.context.direction}
    >
      <div className="h-12">
        {isTrainingConfirmed ? <BackButton color="light" /> : <></>}
      </div>

      <div className="px-12 py-6 flex flex-col">
        <h1 className="text-white text-4xl font-extrabold mb-10">
          Votre parcours personnalisé
        </h1>
        <CardBasic
          title="Mon accompagnateur"
          text={state.context.organism?.label}
        />
        <dl data-test="description-list" className="mt-4">
          <Description term="Diplôme visé">
            <div>{certification?.label}</div>
            {isCertificationPartial && (
              <div className="text-gray-400 text-sm italic">
                Certification visée partiellement
              </div>
            )}
          </Description>

          <DescriptionSimple
            term="Nombre d'heures d'accompagnement individuel"
            detail={individualHourCount}
            suffix="h"
          />

          <DescriptionSimple
            term="Nombre d'heures d'accompagnement collectif"
            detail={collectiveHourCount}
            suffix="h"
          />

          <DescriptionSimple
            term="Nombre d'heures de formation"
            detail={additionalHourCount}
            suffix="h"
          />

          <DescriptionMultiLine
            term="Formations obligatoires"
            details={mandatoryTrainings}
          />

          <DescriptionMultiLine term="Savoirs de base" details={basicSkills} />

          <DescriptionSimple
            term="Bloc de compétences métiers"
            detail={certificateSkills}
          />

          <DescriptionSimple term="Autre" detail={otherTraining} />
        </dl>
        <Checkbox
          checked={isTrainingConfirmed || checkedCondition}
          label="J'ai bien compris qu'il s'agissait des étapes et prestations nécessaires pour que j'obtienne mon diplôme et je m'engage à les suivre ou informer mon accompagnateur de tout abandon dans les 48h. J’ai bien compris que mon accord allait déclencher une demande de prise en charge financière de mon parcours. J'accepte que les résultats de mon étude personnalisée ainsi que le résultat à ma session de jury me soient transmis ainsi qu'à mon accompagnateur."
          name="accept-conditions"
          toggle={() => setCheckedCondition(!checkedCondition)}
          theme="dark"
          className="my-8"
          size="small"
          disabled={isTrainingConfirmed || submitted}
        />
        <div className="flex flex-col items-center">
          {isTrainingConfirmed ? (
            <Button
              className="bg-white text-gray-800"
              data-test="submit-training"
              onClick={() => {
                send({
                  type: "BACK",
                });
              }}
              label="Fermer"
            />
          ) : (
            <Button
              className="bg-white text-gray-800"
              data-test="submit-training"
              disabled={!checkedCondition}
              onClick={() => {
                setSubmitted(true);
                send({
                  type: "SUBMIT_TRAINING_PROGRAM",
                });
              }}
              label="Je confirme"
              loading={state.matches("trainingProgramSummary.loading")}
            />
          )}
        </div>
        {state.context.error ? (
          <p key="error" className="text-red-600 mt-4 text-sm">
            {state.context.error}
          </p>
        ) : (
          <></>
        )}
      </div>
    </Page>
  );
};
