import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useActor } from "@xstate/react";
import { ErrorAlertFromState } from "components/molecules/ErrorAlertFromState/ErrorAlertFromState";
import { useRef } from "react";
import { Interpreter } from "xstate";

import { Page } from "../components/organisms/Page";
import {
  INVALID_LOGIN_TOKEN_ERROR,
  MainContext,
  MainEvent,
  MainState,
  UNKNOWN_CANDIDATE_ERROR,
} from "../machines/main.machine";

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
    <Page className="max-w-2xl" data-test="login-home" title="Connexion">
      <h1 className="text-3xl font-bold text-dsfrBlue-500">
        Bienvenue <span aria-hidden="true">🤝</span>,
      </h1>
      {state.context.error ? (
        <LoginErrorMessage error={state.context.error} />
      ) : (
        <>
          <h2 className="my-6">Connexion</h2>
          <p className="mb-10">
            Pour la sécurité de vos données, merci de renseigner votre email, un
            lien vous sera envoyé afin de retrouver votre candidature.
          </p>
        </>
      )}
      <form onSubmit={onSubmit} className="mb-6 max-w-xl">
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

const LoginErrorMessage = ({ error }: { error: string }) => {
  switch (error) {
    case INVALID_LOGIN_TOKEN_ERROR:
      return (
        <>
          <p
            data-test="login-invalid-token"
            className="mb-6 mt-6 text-red-500 font-semibold"
            role="alert"
          >
            Votre lien d'accès est arrivé à expiration.
          </p>
          <p className="mb-6">
            Pour remédier à ce problème, veuillez entrer à nouveau votre adresse
            e-mail ci-dessous.
            <br />
            Le lien n'est valide que pendant quinze minutes.
          </p>
        </>
      );
    case UNKNOWN_CANDIDATE_ERROR:
      return (
        <>
          <p
            data-test="login-unknown-candidate"
            className="mb-6 mt-6 text-red-500 font-semibold"
            role="alert"
          >
            Oups! Il semble y avoir une erreur.
          </p>
          <p className="mb-6">
            Pour y remédier, nous vous conseillons de :
            <ul className="list-disc list-inside mb-4 mt-4">
              <li>
                vérifier que l'adresse e-mail indiquée est bien celle que vous
                avez utilisée lors de votre inscription
              </li>
              <li>
                entrer à nouveau votre adresse e-mail ci-dessous. Le lien n'est
                valide que pendant quinze minutes.
              </li>
              <li>
                contrôler votre connexion internet et essayez de vous
                reconnecter une fois que celle-ci est assurée et stable.
              </li>
            </ul>
            Si le problème persiste, n'hésitez pas à nous contacter à l'adresse
            e-mail suivante : support@vae.gouv.fr
          </p>
        </>
      );
    default:
      return <ErrorAlertFromState />;
  }
};
