import { useActor } from "@xstate/react";
import { useRef } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface LoginHomeProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
}

interface ContactFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const LoginHome = ({ mainService }: LoginHomeProps) => {
  const [state, send] = useActor(mainService);

  const onSubmit = (event: React.SyntheticEvent<ContactFormElement>) => {
    event.preventDefault();
    const elements = event.currentTarget.elements;
    const email = elements.email.value;
    if (email) {
      send({
        type: "SUBMIT_LOGIN",
        login: { email },
      });
    }
  };

  const emailRef = useRef<HTMLDivElement>(null);

  return (
    <Page
      data-test="login-home"
      className="z-[90] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <h1 className="mb-4 text-center font-bold text-lg text-slate-900">
        Reva
      </h1>
      <div className="h-full flex flex-col px-12 overflow-y-auto pt-4 pb-[400px] text-lg">
        <p className="my-6 mb-10">
          Pour la sécurité de vos données. merci de renseigner votre email, un
          lien vous sera envové afin de retrouver votre candidature.
        </p>
        <form onSubmit={onSubmit} className="space-y-6">
          <Input
            ref={emailRef}
            name="email"
            label="Email"
            type="email"
            required
            placeholder="votre@email.fr"
          />
          {state.context.error && (
            <p key="error" className="text-red-600 my-4 text-sm">
              {state.context.error}
            </p>
          )}
          <div className="pt-6">
            <Button
              data-test={`login-home-submit`}
              type="submit"
              loading={state.matches("loginHome.submitting")}
              label={"Envoyer"}
              size="medium"
            />
          </div>
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => send("BACK")}
              className="text-gray-500 underline"
            >
              Je n'ai pas de candidature
            </button>
          </div>
        </form>
      </div>
    </Page>
  );
};
