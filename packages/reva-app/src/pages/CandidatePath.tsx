import { useActor } from "@xstate/react";
import { FC } from "react";
import { Interpreter } from "xstate";

import { CardBasic } from "../components/atoms/CardBasic";
import { LabelAndText } from "../components/atoms/LabelAndText";
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

  if (!state.context.training) return <></>
  
    const {
      training: {
        appointmentCount,
        individualHourCount,
        collectiveHourCount,
        additionalHourCount,
        certificateSkills,
        otherTraining,
        validatedByCandidate,
      },
      certification
    } = state.context;
  
  return (
    <Page className="z-50 bg-slate-900 p-6 overflow-y-scroll" direction={state.context.direction}>
      <BackButton color="light" onClick={() => send("BACK")} />

      <div className="px-8 pb-8 flex flex-col">
        <h1 className="text-white	text-3xl font-bold mb-16">
          Votre parcours
          <br /> personnalisé
        </h1>

        <CardBasic title="Mon accompagnateur" text={organism} />

        <LabelAndText
          label="Diplome visé"
          text={certification?.label || ""}
        />

        <LabelAndText
          label="Nombre d'heures d'accompagnement individuel"
          text={`${individualHourCount}h`}
        />

        <LabelAndText
          label="Nombre d'heures d'accompagnement collectif"
          text={`${collectiveHourCount}h`}
        />

        <LabelAndText
          label="Nombre d'heures de formation"
          text={`${additionalHourCount}h`}
        />

        <LabelAndText
          label="Formations obligatoires"
          text={[
            "Intitulé de formation",
            "Intitulé de formation",
            "Intitulé de formation",
          ]}
        />

        <LabelAndText label="Savoirs de base" text="20h" />

        <LabelAndText
          label="Bloc de compétences métiers"
          text={certificateSkills}
        />

        <LabelAndText label="Autre" text={otherTraining} />

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
