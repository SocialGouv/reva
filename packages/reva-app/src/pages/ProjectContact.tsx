import { useActor } from "@xstate/react";
import { RefObject, useRef } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { Contact } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

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

  const hasCandidacy = !!state.context.candidacyId;
  const editedContact = state.context.contact;
  const firstnameRef = useRef<HTMLDivElement>(null);
  const lastnameRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);

  return (
    <Page
      className="z-[80] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      {hasCandidacy ? (
        <BackButton onClick={() => send("BACK")} />
      ) : (
        <h1 className="mt-12 mb-4 text-center font-bold">Reva</h1>
      )}
      <div className="h-full flex flex-col px-12 overflow-y-auto pt-4 pb-[400px] text-lg">
        {hasCandidacy ? (
          <></>
        ) : (
          <>
            <p>Bonjour 🤝,</p>
            <p className="my-6 font-bold">
              Votre parcours est unique, tout comme vous.
            </p>
          </>
        )}
        <p className="mb-10">
          Ces informations de contact permettront à votre architecte de parcours
          de vous contacter afin de discuter de votre projet.
        </p>
        <form onSubmit={onSubmit} className="space-y-6">
          <Input
            ref={firstnameRef}
            name="firstname"
            label="Prénom"
            minLength={10}
            defaultValue={editedContact?.phone || ""}
          />
          <Input
            ref={lastnameRef}
            name="lastname"
            label="Nom"
            minLength={10}
            defaultValue={editedContact?.phone || ""}
          />
          <Input
            ref={phoneRef}
            name="phone"
            label="Téléphone"
            minLength={10}
            defaultValue={editedContact?.phone || ""}
          />
          <Input
            ref={emailRef}
            name="email"
            label="Email"
            type="email"
            defaultValue={editedContact?.email || ""}
          />
          {state.matches("projectContact.error") && (
            <p key="error" className="text-red-600 my-4 text-sm">
              {state.context.error}
            </p>
          )}
          <div className="py-6">
            <Button
              data-test={`project-contact-${editedContact ? "save" : "add"}`}
              type="submit"
              loading={state.matches("projectContact.submitting")}
              label={hasCandidacy ? "Valider" : "Commencer"}
              size="medium"
            />
          </div>
        </form>
        {!hasCandidacy && (
          <div className="border-t border-gray-200 pt-6">
            <a href="#" className="text-gray-500 underline">
              J'ai déjà une candidature
            </a>
          </div>
        )}
      </div>
    </Page>
  );
};
