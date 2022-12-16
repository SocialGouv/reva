import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";
import { EmailLink } from "../components/atoms/EmailLink";

import { Title } from "../components/atoms/Title";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent } from "../machines/main.machine";

interface ProjectDroppedOutProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
  candidateName: string;
  candidateEmail: string;
  supportEmail: string;
}

export const ProjectDroppedOut = ({mainService, candidateName, candidateEmail, supportEmail}: ProjectDroppedOutProps) => {
  const [state] = useActor(mainService);

  return (
    <Page
      data-test="home-project-dropped-out"
      className="z-[80] overflow-hidden h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <div className="relative overflow-y-auto flex flex-col rounded-xl p-12 text-slate-600 leading-loose">

        <Title label={`Bonjour ${candidateName},`} size="large" />

        <p className="font-bold mt-6">
          Email: {candidateEmail}
        </p>

        <p className="mt-8">
          Nous avons enregistré l'interruption de votre parcours.<br/>
          Nous vous informons que vous ne pourrez pas candidater à nouveau dans le cadre de cette expérimentation.
        </p>
        <p className="mt-8">
          Vous avez une question ? <EmailLink email={supportEmail}/>
        </p>
      </div>
    </Page>
  );
};
