"use client";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { Candidate, CandidateUpdateInput } from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import useCandidateSummary from "../_components/useCandidateSummary";
import {
  FormCandidateInformationData,
  GenderEnum,
  candidateInformationSchema,
} from "./_components/candidateInformationSchema";
import useUpdateCandidateInformation from "./_components/useUpdateCandidateInformation.hook";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const InformationsCivilesTab = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const genders = [
    { label: "Madame", value: "woman" },
    { label: "Monsieur", value: "man" },
    { label: "Ne se prononce pas", value: "undisclosed" },
  ];

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext<FormCandidateInformationData>();
  const { countries, candidacy, departments } =
    useCandidateSummary(candidacyId);
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
              ...register("lastname"),
            }}
            state={errors.lastname ? "error" : "default"}
            stateRelatedMessage={errors.lastname?.message}
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
              ...register("firstname"),
            }}
            state={errors.firstname ? "error" : "default"}
            stateRelatedMessage={errors.firstname?.message}
          />
          <Input
            label="Prénom 2 (optionnel)"
            className="w-full"
            nativeInputProps={{
              ...register("firstname2"),
            }}
          />
          <Input
            label="Prénom 3 (optionnel)"
            className="w-full"
            nativeInputProps={{
              ...register("firstname3"),
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
          <Select
            className="w-full"
            label="Département de naissance"
            disabled={disabledDepartment}
            nativeSelectProps={{
              ...register("birthDepartment"),
              value: watch("birthDepartment"),
            }}
            state={errors.birthDepartment ? "error" : "default"}
            stateRelatedMessage={errors.birthDepartment?.message}
          >
            <option value="" disabled hidden>
              Votre département
            </option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label} ({d.code})
              </option>
            ))}
          </Select>

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
              ...register("zip"),
            }}
            state={errors.zip ? "error" : "default"}
            stateRelatedMessage={errors.zip?.message}
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
  const { candidacy, countries, getCandidacyRefetch } =
    useCandidateSummary(candidacyId);
  const { updateCandidateInformationMutate } =
    useUpdateCandidateInformation(candidacyId);
  const candidate = candidacy?.candidate;
  const franceId = countries?.find((c) => c.label === "France")?.id;
  const methods = useForm<FormCandidateInformationData>({
    resolver: zodResolver(candidateInformationSchema),
    defaultValues: {
      firstname: candidate?.firstname,
      lastname: candidate?.lastname,
      givenName: candidate?.givenName ?? "",
      firstname2: candidate?.firstname2 ?? "",
      firstname3: candidate?.firstname3 ?? "",
      gender: (candidate?.gender as GenderEnum) ?? GenderEnum.undisclosed,
      birthCity: candidate?.birthCity ?? "",
      birthdate: format(
        candidate?.birthdate ? new Date(candidate?.birthdate) : new Date(),
        "yyyy-MM-dd",
      ),
      birthDepartment: candidate?.birthDepartment?.id ?? "",
      country: candidate?.country?.id ?? franceId,
      nationality: candidate?.nationality ?? "",
      socialSecurityNumber: candidate?.socialSecurityNumber ?? "",
      countryIsFrance: candidate?.country?.id === franceId,
    },
  });
  const { handleSubmit, reset } = methods;

  const resetFormData = useCallback(
    (candidate: Candidate) => {
      if (!candidate) return;
      reset({
        firstname: candidate.firstname,
        lastname: candidate.lastname,
        givenName: candidate.givenName ?? "",
        firstname2: candidate.firstname2 ?? "",
        firstname3: candidate.firstname3 ?? "",
        birthCity: candidate.birthCity ?? "",
        birthdate: format(
          candidate.birthdate ? new Date(candidate?.birthdate) : new Date(),
          "yyyy-MM-dd",
        ),
        birthDepartment: candidate.birthDepartment?.id ?? "",
        country: candidate.country?.id ?? franceId,
        city: candidate.city ?? "",
        countryIsFrance: candidate.country?.id === franceId,
        email: candidate.email ?? "",
        phone: candidate.phone ?? "",
        gender: (candidate.gender as GenderEnum) ?? GenderEnum.undisclosed,
        nationality: candidate.nationality ?? "",
        socialSecurityNumber: candidate.socialSecurityNumber ?? "",
        street: candidate.street ?? "",
        zip: candidate.zip ?? "",
      });
    },
    [reset, franceId],
  );
  useEffect(() => {
    resetFormData(candidate as Candidate);
  }, [candidate, resetFormData]);

  const onSubmit = async (data: FormCandidateInformationData) => {
    const candidateInput: CandidateUpdateInput = {
      id: candidacy?.candidate?.id,
      firstname: data.firstname,
      firstname2: data.firstname2,
      firstname3: data.firstname3,
      lastname: data.lastname,
      givenName: data.givenName,
      birthCity: data.birthCity,
      city: data.city,
      email: data.email,
      phone: data.phone,
      nationality: data.nationality,
      socialSecurityNumber: data.socialSecurityNumber,
      street: data.street,
      zip: data.zip,
      gender: data.gender as GenderEnum,
      countryId: data.country,
      birthdate: new Date(data.birthdate).getTime(),
      birthDepartmentId: data.birthDepartment,
    };

    try {
      await updateCandidateInformationMutate({ candidate: candidateInput });
      successToast("Les informations ont bien été mises à jour");
      await getCandidacyRefetch();
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  if (!candidacy?.candidate) return null;

  return (
    <div className="flex flex-col w-full p-8 gap-8">
      <div>
        <h1>Renseigner les informations</h1>
        <FormOptionalFieldsDisclaimer />
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
          onClick={() => resetFormData(candidate as Candidate)}
        >
          Annuler
        </Button>
        <Button onClick={handleSubmit(onSubmit)}>Enregistrer</Button>
      </div>
    </div>
  );
};

export default CandidateInformationPage;
