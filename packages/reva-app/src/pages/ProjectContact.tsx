import { useActor } from "@xstate/react";
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
      phone: elements.phone.value || null,
      email: elements.email.value || null,
    };
    send({
      type: "SUBMIT_CONTACT",
      contact,
    });
  };

  const editedContact = state.context.contact;

  return (
    <Page
      className="z-[80] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col px-8 overflow-y-auto pt-12 pb-[400px]">
        <p>
          Ces informations de contact permettront à votre accompagnateur de
          prendre contact avec vous pour discuter de votre projet.
        </p>
        <p className="my-4 font-semibold">
          Choisissez le moyen de contact par lequel vous préférez être
          recontacté.e.
        </p>
        <form onSubmit={onSubmit} className="mt-4 space-y-6">
          <Input
            name="phone"
            label="Téléphone"
            minLength={10}
            defaultValue={editedContact?.phone || ""}
          />
          <Input
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
