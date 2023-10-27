import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { useActor } from "@xstate/react";
import { FormOptionalFieldsDisclaimer } from "components/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { ErrorAlertFromState } from "components/molecules/ErrorAlertFromState/ErrorAlertFromState";
import { useRef } from "react";
import { Interpreter } from "xstate";

import { Page } from "../components/organisms/Page";
import { Contact } from "../interface";
import {
  INVALID_REGISTRATION_TOKEN_ERROR,
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
  department: HTMLSelectElement;
}

interface ContactFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const ProjectContact = ({ mainService }: ProjectContactProps) => {
  const [state, send] = useActor(mainService);

  const selectsOptionsDepartments: { label: string; value: string }[] =
    state.context.departments
      .map((r) => ({
        label: r.label,
        value: r.id,
      }))
      .sort((a, b) => new Intl.Collator("fr").compare(a.label, b.label));

  const hasCandidacy = !!state.context.candidacyId;
  const onSubmit = (event: React.SyntheticEvent<ContactFormElement>) => {
    event.preventDefault();
    const elements = event.currentTarget.elements;
    const contact: Contact = {
      firstname: elements.firstname.value || null,
      lastname: elements.lastname.value || null,
      phone: elements.phone.value || null,
      email: elements.email.value || null,
      departmentId: elements.department.value || null,
    };
    send({
      type: hasCandidacy ? "UPDATE_CONTACT" : "SUBMIT_CONTACT",
      contact,
    });
  };
  const editedContact = state.context.contact;
  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const departementRef = useRef<HTMLSelectElement>(null);

  return (
    <Page title="Création de compte">
      {hasCandidacy ? (
        <></>
      ) : state.context.error ? (
        <RegistrationErrorMessage error={state.context.error} />
      ) : (
        <>
          <Alert
            className="mb-6"
            severity="warning"
            title={
              <div className="flex flex-col items-start gap-2 font-normal">
                <h2 className="font-bold ">Attention</h2>
                <p>Seuls quelques diplômes sont actuellement éligibles : </p>
                <a
                  className="fr-link"
                  href="https://airtable.com/shrhMGpOWNPJA15Xh/tblWDa9HN0cuqLnAl"
                  target="_blank"
                  rel="noreferrer"
                  title="Voir tous les diplômes actuellement disponibles via France VAE - nouvelle fenêtre"
                >
                  Voir tous les diplômes actuellement disponibles via France VAE
                </a>
                <p>
                  Les salariés ayant un contrat de travail de droit public, les
                  retraités et les étudiants{" "}
                  <strong>
                    ne peuvent pas bénéficier du financement d’un parcours
                    France VAE à date.
                  </strong>
                </p>
                <a
                  className="fr-link"
                  href="https://airtable.com/appQT21E7Sy70YfSB/shrgvhoKYW1EsXUu5/tblQgchiTKInxOqqr"
                  target="_blank"
                  rel="noreferrer"
                  title="En cas de question, contactez un Point Relais Conseil - nouvelle fenêtre"
                >
                  En cas de question, contactez un Point Relais Conseil
                </a>
              </div>
            }
          />
          <h1 className="text-3xl font-bold text-dsfrBlue-500">
            Bienvenue <span aria-hidden="true">🤝</span>,
          </h1>
        </>
      )}
      <form onSubmit={onSubmit} className="mb-6">
        <fieldset>
          <legend>
            <h2 className="mt-6">Créer votre compte.</h2>
          </legend>

          {state.context.error &&
            state.context.error !== INVALID_REGISTRATION_TOKEN_ERROR && (
              <ErrorAlertFromState />
            )}
          <FormOptionalFieldsDisclaimer className="mb-4" />
          <Input
            label="Prénom"
            nativeInputProps={{
              name: "firstname",
              ref: firstnameRef,
              required: true,
              autoComplete: "given-name",
              defaultValue: editedContact?.firstname || "",
            }}
          />
          <Input
            label="Nom"
            nativeInputProps={{
              name: "lastname",
              ref: lastnameRef,
              required: true,
              autoComplete: "family-name",
              defaultValue: editedContact?.lastname || "",
            }}
          />
          <Input
            label="Téléphone"
            nativeInputProps={{
              name: "phone",
              ref: phoneRef,
              minLength: 10,
              required: true,
              type: "tel",
              autoComplete: "tel",
              defaultValue: editedContact?.phone || "",
            }}
          />
          <Input
            label="Email"
            hintText="Format attendu : nom@domaine.fr"
            nativeInputProps={{
              name: "email",
              ref: emailRef,
              required: true,
              type: "email",
              autoComplete: "email",
              spellCheck: "false",
              defaultValue: editedContact?.email || "",
            }}
          />
          <Select
            className="my-4"
            data-test="certificates-select-department"
            label="Département"
            hint="Sélectionnez votre département de résidence"
            nativeSelectProps={{
              name: "department",
              defaultValue: "",
              required: true,
              ref: departementRef,
            }}
          >
            <option value="" disabled={true} hidden={true}>
              Votre département
            </option>
            {selectsOptionsDepartments.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </fieldset>
        <Button data-test={`project-contact-${editedContact ? "save" : "add"}`} className="mt-6">
          Créez votre compte
        </Button>
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

const RegistrationErrorMessage = ({ error }: { error: string }) => {
  switch (error) {
    case INVALID_REGISTRATION_TOKEN_ERROR:
      return (
        <p
          data-test="project-contact-invalid-token"
          className="mb-6 text-red-500 font-semibold"
          role="alert"
        >
          Votre lien d'inscription est arrivé à expiration. Veuillez soumettre à
          nouveau ce formulaire.
        </p>
      );
    default:
      return <></>;
  }
};
