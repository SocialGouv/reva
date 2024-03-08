"use client";
import { Candidate } from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import useCandidateSummary from "../_components/useCandidateSummary";
import {
  FormInformationsCivilesData,
  GenderEnum,
  informationsCivilesSchema,
} from "./_components/informationsCivilesSchema";
import {
  FormInformationsContactData,
  informationsContactSchema,
} from "./_components/informationsContactSchema";

const InformationsCivilesTab = ({ candidate }: { candidate: Candidate }) => {
  const { countries } = useCandidateSummary(candidate.id);
  const franceId = countries?.find((c) => c.label === "France")?.id;

  const genders = [
    { label: "Madame", value: "woman" },
    { label: "Monsieur", value: "man" },
    { label: "Non précisé", value: "undisclosed" },
  ];
  const { register, watch, setValue, getValues } =
    useForm<FormInformationsCivilesData>({
      resolver: zodResolver(informationsCivilesSchema),
      defaultValues: {
        firstName: candidate.firstname,
        lastName: candidate.lastname,
        usename: candidate.usename ?? "",
        firstName2: candidate.firstname2 ?? "",
        firstName3: candidate.firstname3 ?? "",
        gender: (candidate.gender as GenderEnum) ?? GenderEnum.undisclosed,
        birthCity: candidate.birthCity ?? "",
        birthdate: candidate.birthdate ?? new Date().toISOString(),
        birthDepartment: candidate.birthDepartment ?? "",
        country: candidate.country?.id ?? franceId,
        nationality: candidate.nationality ?? "",
        securiteSocialeNumber: candidate.securiteSocialeNumber ?? "",
      },
    });

  return (
    <div>
      <h6 className="mb-12 text-xl font-bold">Informations civiles</h6>
      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          <Select
            label="Civilité"
            className="w-full"
            nativeSelectProps={{
              onChange: (e) => {
                setValue("gender", e.target.value as GenderEnum);
              },
              defaultValue: getValues("gender"),
              value: watch("gender"),
            }}
          >
            {genders.map(
              ({ value, label }: { value: string; label: string }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </Select>
          <Input
            label="Nom de naissance"
            className="w-full"
            nativeInputProps={{
              ...register("lastName"),
            }}
          />
          <Input label="Nom d'usage (optionnel)" className="w-full" />
        </div>
        <div className="flex gap-6">
          <Input
            label="Prénom principal"
            className="w-full"
            nativeInputProps={{
              ...register("firstName"),
            }}
          />
          <Input
            label="Prénom 2 (optionnel)"
            className="w-full"
            nativeInputProps={{
              ...register("firstName2"),
            }}
          />
          <Input
            label="Prénom 3 (optionnel)"
            className="w-full"
            nativeInputProps={{
              ...register("firstName3"),
            }}
          />
        </div>
        <div className="flex gap-6">
          <Input
            label="Date de naissance"
            className="w-full"
            nativeInputProps={{
              ...register("birthdate"),
            }}
          />
          <Select
            className="w-full"
            label="Pays de naissance"
            nativeSelectProps={{
              onChange: (e) => {
                setValue("country", e.target.value);
              },
              defaultValue: getValues("country"),
              value: watch("country"),
            }}
          >
            {countries?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-6">
          <Input
            label="Département de naissance"
            className="w-full"
            disabled={watch("country") !== "France"}
            nativeInputProps={{
              ...register("birthDepartment"),
            }}
          />
          <Input
            label="Ville de naissance"
            className="w-full"
            nativeInputProps={{
              ...register("birthCity"),
            }}
          />
        </div>
        <div className="flex gap-6">
          <Input
            label="Nationalité"
            className="w-full"
            nativeInputProps={{
              ...register("nationality"),
            }}
          />
          <Input
            label="Numéro de sécurité sociale"
            className="w-full"
            nativeInputProps={{
              ...register("securiteSocialeNumber"),
            }}
          />
        </div>
      </div>
    </div>
  );
};

const InformationsContactTab = ({ candidate }: { candidate: Candidate }) => {
  const { register } = useForm<FormInformationsContactData>({
    resolver: zodResolver(informationsContactSchema),
    defaultValues: {
      email: candidate.email,
      phone: candidate.phone,
    },
  });
  return (
    <div>
      <h6 className="mb-12 text-xl font-bold">Informations de contact</h6>
      <div className="flex flex-col gap-6">
        <Input
          label="Numéro et nom de rue"
          className="w-full"
          nativeInputProps={{
            ...register("street"),
          }}
        />
        <div className="flex gap-4">
          <Input
            label="Code postal"
            className="w-full"
            nativeInputProps={{
              ...register("postalCode"),
            }}
          />
          <Input
            label="Ville"
            className="w-full"
            nativeInputProps={{
              ...register("city"),
            }}
          />
        </div>
        <div className="flex gap-4">
          <Input
            label="Numéro de téléphone"
            className="w-full"
            nativeInputProps={{
              ...register("phone"),
            }}
          />
          <Input
            label="Email"
            className="w-full"
            nativeInputProps={{
              ...register("email"),
            }}
          />
        </div>
      </div>
    </div>
  );
};

const CandidateInformationPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const router = useRouter();
  const { candidacy } = useCandidateSummary(candidacyId);
  if (!candidacy) return null;

  const { candidate } = candidacy;

  return (
    <div className="flex flex-col w-full p-8 gap-8">
      <div>
        <h1 className="text-[40px] leading-[48px] font-bold mb-2">
          Renseigner les informations
        </h1>
        <p className="text-light-text-mention-grey text-xs leading-5">
          Sauf mention contraire “(optionnel)” dans le label, tous les champs
          sont obligatoires.
        </p>
      </div>

      <Tabs
        tabs={[
          {
            label: "Informations civiles",
            content: (
              <InformationsCivilesTab candidate={candidate as Candidate} />
            ),
          },
          {
            label: "Informations de contact",
            content: (
              <InformationsContactTab candidate={candidate as Candidate} />
            ),
          },
        ]}
      />

      <div className="flex gap-6 justify-end">
        <Button
          priority="secondary"
          onClick={() => router.push(`/candidacies/${candidacyId}/summary`)}
        >
          Annuler
        </Button>
        <Button>Enregistrer</Button>
      </div>
    </div>
  );
};

export default CandidateInformationPage;
