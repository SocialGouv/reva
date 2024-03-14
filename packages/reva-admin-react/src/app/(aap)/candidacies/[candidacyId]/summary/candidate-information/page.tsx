"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import useCandidateSummary from "../_components/useCandidateSummary";
import {
  FormCandidateInformationData,
  GenderEnum,
  candidateInformationSchema,
} from "./_components/candidateInformationSchema";

const InformationsCivilesTab = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const genders = [
    { label: "Madame", value: "woman" },
    { label: "Monsieur", value: "man" },
    { label: "Non précisé", value: "undisclosed" },
  ];

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext<FormCandidateInformationData>();
  const { countries, candidacy } = useCandidateSummary(candidacyId);
  const country = watch("country");
  const [disabledDepartment, setDisabledDepartment] = useState(
    country !== "France",
  );
  const franceId = countries?.find((c) => c.label === "France")?.id;

  useEffect(() => {
    if (country !== franceId) {
      setValue("birthDepartment", "");
      setDisabledDepartment(true);
      setValue("countryIsFrance", false);
      clearErrors("birthDepartment");
    } else {
      setDisabledDepartment(false);
      setValue("countryIsFrance", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, franceId, setValue, setDisabledDepartment]);

  useEffect(() => {
    setValue("country", candidacy?.candidate?.country?.id ?? franceId);
  }, [franceId, countries, candidacy, setValue]);

  return (
    <>
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
              value: watch("gender"),
            }}
            state={errors.gender ? "error" : "default"}
            stateRelatedMessage={errors.gender?.message}
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
            state={errors.lastName ? "error" : "default"}
            stateRelatedMessage={errors.lastName?.message}
          />
          <Input
            label="Nom d'usage (optionnel)"
            className="w-full"
            nativeInputProps={{
              ...register("givenName"),
            }}
          />
        </div>
        <div className="flex gap-6">
          <Input
            label="Prénom principal"
            className="w-full"
            nativeInputProps={{
              ...register("firstName"),
            }}
            state={errors.firstName ? "error" : "default"}
            stateRelatedMessage={errors.firstName?.message}
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
              type: "date",
            }}
            state={errors.birthdate ? "error" : "default"}
            stateRelatedMessage={errors.birthdate?.message}
          />
          <Select
            className="w-full"
            label="Pays de naissance"
            nativeSelectProps={{
              ...register("country"),
            }}
            state={errors.country ? "error" : "default"}
            stateRelatedMessage={errors.country?.message}
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
            disabled={disabledDepartment}
            nativeInputProps={{
              ...register("birthDepartment"),
            }}
            state={errors.birthDepartment ? "error" : "default"}
            stateRelatedMessage={errors.birthDepartment?.message}
          />
          <Input
            label="Ville de naissance"
            className="w-full"
            nativeInputProps={{
              ...register("birthCity"),
            }}
            state={errors.birthCity ? "error" : "default"}
            stateRelatedMessage={errors.birthCity?.message}
          />
        </div>
        <div className="flex gap-6">
          <Input
            label="Nationalité"
            className="w-full"
            nativeInputProps={{
              ...register("nationality"),
            }}
            state={errors.nationality ? "error" : "default"}
            stateRelatedMessage={errors.nationality?.message}
          />
          <Input
            label="Numéro de sécurité sociale"
            className="w-full"
            nativeInputProps={{
              ...register("socialSecurityNumber"),
            }}
            state={errors.socialSecurityNumber ? "error" : "default"}
            stateRelatedMessage={errors.socialSecurityNumber?.message}
          />
        </div>
      </div>
    </>
  );
};

const InformationsContactTab = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormCandidateInformationData>();
  return (
    <>
      <h6 className="mb-12 text-xl font-bold">Informations de contact</h6>
      <div className="flex flex-col gap-6">
        <Input
          label="Numéro et nom de rue"
          className="w-full"
          nativeInputProps={{
            ...register("street"),
          }}
          state={errors.street ? "error" : "default"}
          stateRelatedMessage={errors.street?.message}
        />
        <div className="flex gap-4">
          <Input
            label="Code postal"
            className="w-full"
            nativeInputProps={{
              ...register("postalCode"),
            }}
            state={errors.postalCode ? "error" : "default"}
            stateRelatedMessage={errors.postalCode?.message}
          />
          <Input
            label="Ville"
            className="w-full"
            nativeInputProps={{
              ...register("city"),
            }}
            state={errors.city ? "error" : "default"}
            stateRelatedMessage={errors.city?.message}
          />
        </div>
        <div className="flex gap-4">
          <Input
            label="Numéro de téléphone"
            className="w-full"
            nativeInputProps={{
              ...register("phone"),
            }}
            state={errors.phone ? "error" : "default"}
            stateRelatedMessage={errors.phone?.message}
          />
          <Input
            label="Email"
            className="w-full"
            nativeInputProps={{
              ...register("email"),
            }}
            state={errors.email ? "error" : "default"}
            stateRelatedMessage={errors.email?.message}
          />
        </div>
      </div>
    </>
  );
};

const CandidateInformationPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const router = useRouter();
  const { candidacy, countries } = useCandidateSummary(candidacyId);
  const candidate = candidacy?.candidate;
  const franceId = countries?.find((c) => c.label === "France")?.id;

  const methods = useForm<FormCandidateInformationData>({
    resolver: zodResolver(candidateInformationSchema),
    defaultValues: {
      firstName: candidate?.firstname,
      lastName: candidate?.lastname,
      givenName: candidate?.givenName ?? "",
      firstName2: candidate?.firstname2 ?? "",
      firstName3: candidate?.firstname3 ?? "",
      gender: (candidate?.gender as GenderEnum) ?? GenderEnum.undisclosed,
      birthCity: candidate?.birthCity ?? "",
      birthdate: format(
        candidate?.birthdate ? new Date(candidate?.birthdate) : new Date(),
        "yyyy-MM-dd",
      ),
      birthDepartment: candidate?.birthDepartment?.label ?? "",
      country: candidate?.country?.id ?? franceId,
      nationality: candidate?.nationality ?? "",
      socialSecurityNumber: candidate?.socialSecurityNumber ?? "",
      countryIsFrance: candidate?.country?.id === franceId,
    },
  });
  const { handleSubmit } = methods;

  const onSubmit = async (data: FormCandidateInformationData) => {
    console.log(data);
  };

  if (!candidacy?.candidate) return null;

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

      <FormProvider {...methods}>
        <Tabs
          tabs={[
            {
              label: "Informations civiles",
              content: <InformationsCivilesTab />,
            },
            {
              label: "Informations de contact",
              content: <InformationsContactTab />,
            },
          ]}
        />
      </FormProvider>

      <div className="flex gap-6 justify-end">
        <Button
          priority="secondary"
          onClick={() => router.push(`/candidacies/${candidacyId}/summary`)}
        >
          Annuler
        </Button>
        <Button onClick={handleSubmit(onSubmit)}>Enregistrer</Button>
      </div>
    </div>
  );
};

export default CandidateInformationPage;
