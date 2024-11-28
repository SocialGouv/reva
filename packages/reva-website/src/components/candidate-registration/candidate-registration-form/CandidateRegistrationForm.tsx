import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Input from "@codegouvfr/react-dsfr/Input";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import request from "graphql-request";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";
import * as z from "zod";

import {
  CandidateTypology,
  CandidateTypologySelect,
} from "../candidate-typology-select/CandidateTypologySelect";

const getDepartmentsQuery = graphql(`
  query getDepartments {
    getDepartments {
      id
      code
      label
    }
  }
`);

interface DepartmentOption {
  label: string;
  value: string;
}

const zodSchema = z.object({
  firstname: z.string().min(1, "Merci de remplir ce champ"),
  lastname: z.string().min(1, "Merci de remplir ce champ"),
  phone: z.string().min(10, "Veuillez entrer un numéro de téléphone valide"),
  email: z.string().email("Format attendu : nom@domaine.fr"),
  departmentId: z
    .string({
      required_error: "Merci de remplir ce champ",
    })
    .min(1, "Merci de remplir ce champ"),
  typeAccompagnement: z.enum(["ACCOMPAGNE", "AUTONOME"]).optional(),
});

export type CandidateRegistrationFormSchema = z.infer<typeof zodSchema>;

export const CandidateRegistrationForm = ({
  onSubmit,
}: {
  onSubmit(form: CandidateRegistrationFormSchema): void;
}) => {
  const { isFeatureActive } = useFeatureflipping();

  const [availableDepartments, setAvailableDepartments] = useState<
    DepartmentOption[]
  >([]);

  const candidacyCreationDisabled = isFeatureActive(
    "CANDIDACY_CREATION_DISABLED",
  );
  const [candidateTypology, setCandidateTypology] = useState<
    CandidateTypology | undefined
  >();

  const UNSUPPORTED_TYPOLOGIES = ["SALARIE_PUBLIC"];

  const invalidTypology =
    candidateTypology !== undefined &&
    UNSUPPORTED_TYPOLOGIES.includes(candidateTypology);

  const validTypology = candidateTypology && !invalidTypology;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm<CandidateRegistrationFormSchema>({
    resolver: zodResolver(zodSchema),
  });

  const departmentIdController = useController({
    name: "departmentId",
    control,
  });

  useEffect(() => {
    const initAvailableDepartments = async () =>
      setAvailableDepartments(
        (await request(GRAPHQL_API_URL, getDepartmentsQuery)).getDepartments
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((d) => ({ label: d.label, value: d.id })),
      );
    initAvailableDepartments();
  }, []);

  const handleFormSubmit = handleSubmit((form) => {
    if (!form.typeAccompagnement) {
      setError("typeAccompagnement", {
        type: "required",
        message: "Merci de remplir ce champ",
      });
    }
    onSubmit(form);
  });

  return (
    <form
      data-testid="candidate-registration-form"
      className="flex flex-col gap-12"
      onSubmit={handleFormSubmit}
    >
      <div>
        <h2>Modalités de parcours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <RadioButtons
            data-testid="candidate-modalite-parcours-radio-buttons"
            className="!inline"
            legend="Que souhaitez-vous faire pour ce parcours ? "
            options={[
              {
                label: "Je souhaite réaliser ma VAE avec un accompagnateur",
                nativeInputProps: {
                  value: "ACCOMPAGNE",
                  ...register("typeAccompagnement"),
                },
              },
              {
                label: "Je souhaite réaliser ma VAE en autonomie",
                nativeInputProps: {
                  value: "AUTONOME",
                  ...register("typeAccompagnement"),
                },
              },
            ]}
            state={errors.typeAccompagnement ? "error" : "default"}
            stateRelatedMessage={
              errors.typeAccompagnement && "Veuillez sélectionner une option"
            }
          />
          <CallOut
            title="À quoi sert un accompagnateur ?"
            classes={{ title: "pb-2" }}
          >
            C’est un expert de la VAE qui vous aide à chaque grande étape de
            votre parcours : rédaction du dossier de faisabilité, communication
            avec le certificateur, préparation au passage devant le jury, etc.
            <br />
            <br />
            <strong>Bon à savoir :</strong> ces accompagnements peuvent être en
            partie financés par votre{" "}
            <Link
              href="https://www.moncompteformation.gouv.fr/espace-public/consulter-mes-droits-formation"
              target="_blank"
            >
              Compte Personnel de Formation
            </Link>
            . À noter : si vous faites votre parcours en autonomie, il est
            possible que des frais soient à votre charge (jury, formation…).
          </CallOut>
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="font-bold mt-4">Quel est votre statut ?</h2>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <span className="max-w-lg basis-1/2">
            <CandidateTypologySelect
              candidateTypology={candidateTypology}
              onChange={setCandidateTypology}
            />
          </span>
          {invalidTypology && (
            <Notice
              data-testid="candidate-typology-error-panel"
              className="basis-1/2"
              title={
                <span>
                  Votre situation ne vous permet pas de réaliser un parcours VAE
                  sur{" "}
                  <a href="https://vae.gouv.fr/" target="_blank">
                    vae.gouv.fr
                  </a>
                  . Pour savoir si d’autres options existent, vous pouvez
                  contacter dès à présent un{" "}
                  <a
                    href="https://vae.gouv.fr/savoir-plus/articles/liste-prc/"
                    target="_blank"
                  >
                    point relais conseil
                  </a>{" "}
                  ou un{" "}
                  <a href="https://mon-cep.org/#trouver" target="_blank">
                    conseiller en évolution professionnelle
                  </a>
                  .
                </span>
              }
            />
          )}
          {validTypology && candidacyCreationDisabled && (
            <Alert
              severity="warning"
              data-testid="candidate-typology-error-panel"
              className="basis-1/2"
              title={
                <p className="font-normal">
                  En raison d'une mise à jour technique, le service
                  d'inscription sera indisponible jusqu'au lundi 28 octobre.
                </p>
              }
            />
          )}
        </div>
      </div>

      {validTypology && !candidacyCreationDisabled && (
        <div className="flex flex-col">
          <h2 className="font-bold mt-8">Créez votre compte</h2>
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <Input
              data-testid="candidate-registration-form-firstname-input"
              label="Prénom"
              state={errors.firstname ? "error" : "default"}
              stateRelatedMessage={errors.firstname?.message}
              nativeInputProps={{ ...register("firstname") }}
            />
            <Input
              data-testid="candidate-registration-form-lastname-input"
              label="Nom"
              state={errors.lastname ? "error" : "default"}
              stateRelatedMessage={errors.lastname?.message}
              nativeInputProps={{ ...register("lastname") }}
            />
            <Input
              className="md:mt-6"
              data-testid="candidate-registration-form-phone-input"
              label="Téléphone"
              state={errors.phone ? "error" : "default"}
              stateRelatedMessage={errors.phone?.message}
              nativeInputProps={{
                ...register("phone"),
                autoComplete: "phone",
                type: "phone",
              }}
            />
            <Input
              data-testid="candidate-registration-form-email-input"
              label="Email"
              hintText="Format attendu : nom@domaine.fr"
              state={errors.email ? "error" : "default"}
              stateRelatedMessage={errors.email?.message}
              nativeInputProps={{
                ...register("email"),
                autoComplete: "email",
                type: "email",
                spellCheck: "false",
              }}
            />
            <Select
              data-testid="candidate-registration-form-department-select"
              label="Département"
              hint="Entrez votre département de résidence"
              state={errors.departmentId ? "error" : "default"}
              stateRelatedMessage={errors.departmentId?.message}
              nativeSelectProps={{
                value: departmentIdController.field.value,
                onChange: departmentIdController.field.onChange,
              }}
            >
              {!departmentIdController.field.value && (
                <option value={undefined} />
              )}
              {availableDepartments.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </fieldset>
          <div className="flex self-end mt-8 gap-4">
            <Button priority="tertiary no outline" type="reset">
              Réinitialiser
            </Button>
            <Button
              data-testid="candidate-registration-submit-button"
              type="submit"
            >
              Enregistrer
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};
