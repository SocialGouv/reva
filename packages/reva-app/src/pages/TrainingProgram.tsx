import { useActor } from "@xstate/react";
import { FC } from "react";
import { Interpreter } from "xstate";

import { CardBasic } from "../components/atoms/CardBasic";
import { DescriptionMultiLine } from "../components/molecules/DescriptionMultiLine";
import { DescriptionSimple } from "../components/molecules/DescriptionSimple";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface Props {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const TrainingProgram: FC<Props> = ({ mainService }) => {
  const [state] = useActor(mainService);

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
  } = state.context;

  return (
    <Page
      className="z-50 bg-slate-900 p-6 overflow-y-scroll"
      direction={state.context.direction}
    >
      <div className="px-4 pb-8 flex flex-col">
        <h1 className="text-white text-4xl font-extrabold my-8">
          Votre parcours personnalisé
        </h1>

        <CardBasic
          title="Mon accompagnateur"
          text={state.context.organism?.label}
        />

        <dl>
          <DescriptionSimple
            term="Diplome visé"
            detail={certification?.label}
          />

          <DescriptionSimple
            term="Nombre d'heures d'accompagnement individuel"
            detail={`${individualHourCount}h`}
          ></DescriptionSimple>

          <DescriptionSimple
            term="Nombre d'heures d'accompagnement collectif"
            detail={`${collectiveHourCount}h`}
          />

          <DescriptionSimple
            term="Nombre d'heures de formation"
            detail={`${additionalHourCount}h`}
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

        <button
          className="bg-gray-200 text-gray-600 font-bold py-2 px-4 rounded"
          data-test="submit-confirm-path"
          onClick={
            () => alert("SUBMIT_CONFIRM_PATH")
            // send({
            //   type: "SUBMIT_CONFIRM_PATH",
            // })
          }
        >
          Je confirme
        </button>
      </div>
    </Page>
  );
};
