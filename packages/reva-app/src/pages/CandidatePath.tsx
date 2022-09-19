import { useActor } from "@xstate/react";
import { FC } from "react";
import { Interpreter } from "xstate";

import { CardBasic } from "../components/atoms/CardBasic";
import { Description } from "../components/atoms/Description";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface Props {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
  organism: string;
}

export const CandidatePath: FC<Props> = ({
  mainService,
  organism = "CNEAP Hauts de France",
}) => {
  const [state, send] = useActor(mainService);

  if (!state.context.trainingProgram) return <></>;
  
    const {
      trainingProgram: {
        individualHourCount,
        collectiveHourCount,
        additionalHourCount,
        certificateSkills,
        otherTraining,
      },
      certification,
    } = state.context;
  
  return (
    <Page
      className="z-50 bg-slate-900 p-6 overflow-y-scroll"
      direction={state.context.direction}
    >
      <BackButton color="light" onClick={() => send("BACK")} />

      <div className="px-8 pb-8 flex flex-col">
        <h1 className="text-white	text-3xl font-bold mb-16">
          Votre parcours
          <br /> personnalisé
        </h1>

        <CardBasic title="Mon accompagnateur" text={organism} />

        <dl>
          <Description term="Diplome visé" detail={certification?.label || ""} />

          <Description
            term="Nombre d'heures d'accompagnement individuel"
            detail={`${individualHourCount}h`}
          />

          <Description
            term="Nombre d'heures d'accompagnement collectif"
            detail={`${collectiveHourCount}h`}
          />

          <Description
            term="Nombre d'heures de formation"
            detail={`${additionalHourCount}h`}
          />

          <Description
            term="Formations obligatoires"
            detail={[
              "Intitulé de formation",
              "Intitulé de formation",
              "Intitulé de formation",
            ]}
          />

          <Description term="Savoirs de base" detail="20h" />

          <Description
            term="Bloc de compétences métiers"
            detail={certificateSkills}
          />

          <Description term="Autre" detail={otherTraining} />
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
