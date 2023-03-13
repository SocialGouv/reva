import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useActor } from "@xstate/react";
import { useRef } from "react";
import { Interpreter } from "xstate";

import { Page } from "../components/organisms/Page";
import { Contact } from "../interface";
import {
  INVALID_TOKEN_ERROR,
  MainContext,
  MainEvent,
  MainState,
} from "../machines/main.machine";

interface ProjectContactProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

interface FormElements extends HTMLFormControlsCollection {
  firstname: HTMLInputElement;
  lastname: HTMLInputElement;
  phone: HTMLInputElement;
  email: HTMLInputElement;
}

interface ContactFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const ProjectContact = ({ mainService }: ProjectContactProps) => {
  const [state, send] = useActor(mainService);

  const hasCandidacy = !!state.context.candidacyId;
  const onSubmit = (event: React.SyntheticEvent<ContactFormElement>) => {
    event.preventDefault();
    const elements = event.currentTarget.elements;
    const contact: Contact = {
      firstname: elements.firstname.value || null,
      lastname: elements.lastname.value || null,
      phone: elements.phone.value || null,
      email: elements.email.value || null,
    };
    send({
      type: "SUBMIT_CONTACT",
      contact,
    });
  };
  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  return (
    <Page direction={state.context.direction}>
      {hasCandidacy ? (
        <></>
      ) : state.context.error === INVALID_TOKEN_ERROR ? (
        <p
          data-test="project-contact-invalid-token"
          className="mb-6 text-red-500 font-semibold"
        >
          Votre lien d'accès est arrivé à expiration. Veuillez soumettre à
          nouveau ce formulaire.
        </p>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-dsfrBlue-500">
            Bienvenue 🤝,
          </h1>
          <h2 className="my-6">Se créer un compte.</h2>
        </>
      )}
      <form onSubmit={onSubmit} className="mb-6">
        <Input
          label="Prénom"
          nativeInputProps={{
            name: "firstname",
            ref: firstnameRef,
            required: true,
          }}
        />

        <Input
          label="Nom"
          nativeInputProps={{
            name: "lastname",
            ref: lastnameRef,
            required: true,
          }}
        />

        <Input
          label="Téléphone"
          hintText="Format attendu : 00 33 X XX XX XX XX"
          nativeInputProps={{
            name: "phone",
            ref: phoneRef,
            minLength: 10,
            required: true,
          }}
        />

        <Input
          label="Email"
          nativeInputProps={{
            name: "email",
            ref: emailRef,
            required: true,
            placeholder: "votre@email.fr",
          }}
        />

        {state.context.error && state.context.error !== INVALID_TOKEN_ERROR && (
          <p key="error" className="text-red-600 my-4 text-sm">
            {state.context.error}
          </p>
        )}
        <Button data-test="project-contact-add">Valider</Button>
      </form>
      {!hasCandidacy && (
        <div className="border-t border-gray-200 pt-6">
          <button
            data-test="project-contact-login"
            onClick={() => send("LOGIN")}
            className="text-gray-500 underline"
          >
            J'ai déjà un compte
          </button>
        </div>
      )}
    </Page>
  );
};
