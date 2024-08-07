import {
  ApolloClient,
  ApolloContextValue,
  getApolloContext,
} from "@apollo/client";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import Select from "@codegouvfr/react-dsfr/Select";
import { useActor } from "@xstate/react";
import { FormOptionalFieldsDisclaimer } from "components/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { ErrorAlertFromState } from "components/molecules/ErrorAlertFromState/ErrorAlertFromState";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { getActiveFeaturesForConnectedUser } from "services/featureFlippingServices";
import { Interpreter } from "xstate";

import { BackToHomeButton } from "../components/molecules/BackToHomeButton/BackToHomeButton";
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

const modalDistanceInfo = createModal({
  id: "project-home-modal-email",
  isOpenedByDefault: false,
});

export const ProjectContact = ({ mainService }: ProjectContactProps) => {
  const [state, send] = useActor(mainService);
  const [elementsSubmitting, setElementsSubmitting] =
    useState<FormElements | null>(null);

  const [activeFeatures, setActiveFeatures] = useState<string[] | null>(null);

  const { client } = useContext(
    getApolloContext() as React.Context<ApolloContextValue>,
  );

  useEffect(() => {
    const loadActiveFeatures = async () => {
      setActiveFeatures(
        await getActiveFeaturesForConnectedUser(client as ApolloClient<object>),
      );
    };

    loadActiveFeatures();
  }, [client]);

  const candidacyCreationDisabled = activeFeatures?.includes(
    "CANDIDACY_CREATION_DISABLED",
  );

  const isModalEmailOpen = useIsModalOpen(modalDistanceInfo);
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
      candidateId: state.context.contact?.candidateId || "unknown candidate",
      firstname: elements.firstname.value || null,
      lastname: elements.lastname.value || null,
      phone: elements.phone.value || null,
      email: elements.email.value || null,
      departmentId: elements.department?.value || null,
    };

    const showModalUpdateEmail = hasCandidacy && initialEmail !== contact.email;

    if (!showModalUpdateEmail) {
      return send({
        type: hasCandidacy ? "UPDATE_CONTACT" : "SUBMIT_CONTACT",
        contact,
      });
    }
    modalDistanceInfo.open();
    setElementsSubmitting(elements);
  };
  const editedContact = state.context.contact;
  const initialEmail = useMemo(
    () => editedContact?.email || "",
    [editedContact],
  );
  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const departementRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (elementsSubmitting && !isModalEmailOpen) {
      const contact: Contact = {
        candidateId: state.context.contact?.candidateId || "unknown candidate",
        firstname: elementsSubmitting?.firstname.value || null,
        lastname: elementsSubmitting?.lastname.value || null,
        phone: elementsSubmitting?.phone.value || null,
        email: elementsSubmitting?.email.value || null,
        departmentId: elementsSubmitting?.department?.value || null,
      };
      send({
        type: hasCandidacy ? "UPDATE_CONTACT" : "SUBMIT_CONTACT",
        contact,
      });
    }
  }, [
    elementsSubmitting,
    isModalEmailOpen,
    send,
    hasCandidacy,
    state.context.contact?.candidateId,
  ]);

  if (!activeFeatures) {
    return null;
  }
  return (
    <>
      <Page className="max-w-4xl" title="Création de compte">
        {hasCandidacy ? (
          <BackToHomeButton />
        ) : state.context.error ? (
          <RegistrationErrorMessage error={state.context.error} />
        ) : (
          <>
            {candidacyCreationDisabled ? (
              <Alert
                className="mb-6"
                severity="warning"
                title={
                  <p className="font-normal">
                    Le dépôt de nouvelles candidatures est temporairement
                    indisponible. Nous vous remercions de votre patience et nous
                    excusons pour tout désagrément.
                  </p>
                }
              />
            ) : (
              <>
                <Alert
                  className="mb-6"
                  severity="warning"
                  title={
                    <div className="flex flex-col items-start gap-2 font-normal">
                      <h2 className="font-bold text-xl">Attention</h2>
                      <p>
                        Seuls quelques diplômes sont actuellement éligibles :{" "}
                      </p>
                      <a
                        className="fr-link"
                        href="https://metabase.vae.gouv.fr/public/dashboard/e5a2b59d-26b2-443b-a874-d4561f1322eb"
                        target="_blank"
                        rel="noreferrer"
                        title="Voir tous les diplômes actuellement disponibles via France VAE - nouvelle fenêtre"
                      >
                        Voir tous les diplômes actuellement disponibles via
                        France VAE
                      </a>
                      <p>
                        Les salariés ayant un contrat de travail de droit
                        public, les retraités et les étudiants{" "}
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

                <h1 className="text-3xl font-bold text-dsfrBlue-500 mb-0">
                  Bienvenue <span aria-hidden="true">🤝</span>,
                </h1>
              </>
            )}
          </>
        )}

        {(hasCandidacy || !candidacyCreationDisabled) && (
          <form onSubmit={onSubmit} className="flex flex-col">
            <fieldset>
              <legend>
                <h2 className="mt-6 mb-2">
                  {hasCandidacy
                    ? "Modifiez vos informations"
                    : "Créer votre compte"}
                </h2>
              </legend>

              {state.context.error &&
                state.context.error !== INVALID_REGISTRATION_TOKEN_ERROR && (
                  <ErrorAlertFromState />
                )}
              <FormOptionalFieldsDisclaimer
                className="mb-4"
                label="Tous les champs sont obligatoires."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  className="sm:pt-6"
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
              </div>
              {!hasCandidacy && (
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
              )}
            </fieldset>
            <Button
              data-test={`project-contact-${editedContact ? "save" : "add"}`}
              className="my-6 self-end w-full sm:w-auto flex justify-center"
            >
              {hasCandidacy
                ? "Modifiez les informations"
                : "Créer votre compte"}
            </Button>
          </form>
        )}

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
      <modalDistanceInfo.Component
        title={
          <div className="flex gap-2">
            <span className="fr-icon-arrow-right-line fr-icon--lg"></span>
            <span>
              Votre demande de changement d'e-mail de connexion a bien été prise
              en compte
            </span>
          </div>
        }
        size="large"
      >
        <p className="my-4">
          Afin de valider ce changement, un e-mail d'activation a été envoyé sur
          votre nouvelle adresse. Si vous ne trouvez pas notre e-mail, pensez à
          vérifier votre dossier de courriers indésirables (spams).
        </p>
      </modalDistanceInfo.Component>
    </>
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
