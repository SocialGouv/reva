import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useActor } from "@xstate/react";
import { ErrorAlertFromState } from "components/molecules/ErrorAlertFromState/ErrorAlertFromState";
import { useRef } from "react";
import { Interpreter } from "xstate";

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

  const emailRef = useRef<HTMLInputElement>(null);

  return (
    <Page
      data-test="login-home"
      title="connexion"
      direction={state.context.direction}
    >
      <h1 className="text-3xl font-bold text-dsfrBlue-500">
        Bienvenue <span aria-hidden="true">🤝</span>,
      </h1>
      <h2 className="my-6">Connexion</h2>
      <p className="mb-10">
        Pour la sécurité de vos données, merci de renseigner votre email, un
        lien vous sera envoyé afin de retrouver votre candidature.
      </p>
      <form onSubmit={onSubmit} className="mb-6">
        <ErrorAlertFromState />
        <Input
          hintText="Format attendu : nom@domaine.fr"
          nativeInputProps={{
            id: "email",
            ref: emailRef,
            name: "email",
            required: true,
            type: "email",
            autoComplete: "email",
            spellCheck: "false",
          }}
          label="Email"
        />
        <Button data-test={`login-home-submit`}>Me connecter</Button>
      </form>
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => send("BACK")}
          className="text-gray-500 underline"
        >
          Je n'ai pas de candidature
        </button>
      </div>
    </Page>
  );
};
