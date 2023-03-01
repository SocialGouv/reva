import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Header } from "../components/atoms/Header";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent } from "../machines/main.machine";

interface ErrorProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const Error = ({ mainService }: ErrorProps) => {
  const [state, send] = useActor(mainService);

  return (
    <Page
      className="z-[60] h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton />
      <div className="grow flex flex-col text-center items-center justify-center px-10">
        <Header label="Oups..." size="small" />
        <p>{state.context.error}</p>
        <div className="mt-8">
          <Button
            data-test="error-back"
            size="small"
            label="Retour"
            onClick={() => send("BACK")}
          />
        </div>
      </div>
    </Page>
  );
};
