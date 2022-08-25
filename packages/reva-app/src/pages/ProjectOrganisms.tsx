import { Capacitor } from "@capacitor/core";
import { useActor } from "@xstate/react";
import { RefObject, useRef } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { Contact } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface ProjectOrganismsProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

interface FormElements extends HTMLFormControlsCollection {
  phone: HTMLInputElement;
  email: HTMLInputElement;
}

interface ContactFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const ProjectOrganisms = ({ mainService }: ProjectOrganismsProps) => {
  const [state, send] = useActor(mainService);

  const onSubmit = (event: React.SyntheticEvent<ContactFormElement>) => {
    event.preventDefault();
    const elements = event.currentTarget.elements;
    const contact: Contact = {
      phone: elements.phone.value || null,
      email: elements.email.value || null,
    };
    send({
      type: "SUBMIT_CONTACT",
      contact,
    });
  };

  const editedContact = state.context.contact;
  const phoneRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const scrollToInput = (ref: RefObject<HTMLDivElement>) =>
    Capacitor.getPlatform() === "android"
      ? () => ref.current?.scrollIntoView()
      : () => {};

  const region = { label: "Normandie" };

  return (
    <Page
      className="z-[80] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col px-8 overflow-y-auto pt-12 pb-[400px]">
        <Title
          label={`Accompagnateurs disponibles pour la région ${region.label}`}
        />
        <p className="my-4">
          Choisissez l'accompagnateur qui vous aidera à construire ce projet.
        </p>
        <form onSubmit={onSubmit} className="mt-4 space-y-6">
          <Input
            ref={phoneRef}
            name="phone"
            label="Téléphone"
            minLength={10}
            onFocus={scrollToInput(phoneRef)}
            defaultValue={editedContact?.phone || ""}
          />
          <Input
            ref={emailRef}
            name="email"
            label="Email"
            onFocus={scrollToInput(emailRef)}
            type="email"
            defaultValue={editedContact?.email || ""}
          />
          {state.matches("projectContact.error") && (
            <p key="error" className="text-red-600 my-4 text-sm">
              {state.context.error}
            </p>
          )}
          <Button
            data-test={`project-contact-${editedContact ? "save" : "add"}`}
            type="submit"
            loading={state.matches("projectContact.submitting")}
            label={editedContact ? "Valider" : "Ajouter"}
            size="small"
          />
        </form>
      </div>
    </Page>
  );
};
