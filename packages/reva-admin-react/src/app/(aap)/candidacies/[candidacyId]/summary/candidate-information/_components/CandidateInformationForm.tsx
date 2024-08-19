import {
  Candidate,
  CandidateUpdateInformationInput,
} from "@/graphql/generated/graphql";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";

import { AutocompleteAddress } from "@/components/autocomplete-address/AutocompleteAdress";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { GenderEnum } from "@/constants";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FormCandidateInformationData,
  candidateInformationSchema,
} from "./candidateInformationSchema";
import {
  Candidacy,
  Countries,
  Departments,
  useUpdateCandidateInformation,
} from "./useCandidateInformation";

const CandidateInformationForm = ({
  candidacyId,
  candidacy,
  countries,
  departments,
}: {
  candidacyId: string;
  candidacy?: Candidacy;
  countries?: Countries;
  departments?: Departments;
}) => {
  const queryClient = useQueryClient();
  const { updateCandidateInformationMutate } =
    useUpdateCandidateInformation(candidacyId);

  const candidate = candidacy?.candidate;
  const isAddressAlreadyComplete =
    !!candidate?.street && !!candidate?.zip && !!candidate?.city;

  const [completeAddressSelected, setCompleteAddressSelected] = useState(
    isAddressAlreadyComplete,
  );
  const franceId = countries?.find((c) => c.label === "France")?.id;

  const genders = [
    { label: "Madame", value: "woman" },
    { label: "Monsieur", value: "man" },
    { label: "Ne se prononce pas", value: "undisclosed" },
  ];

  const {
    register,
    watch,
    setValue,
    reset,
    formState,
    formState: { errors },
    clearErrors,
    handleSubmit,
  } = useForm<FormCandidateInformationData>({
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
      countryIsFrance: candidate?.country?.id === franceId,
      street: candidate?.street ?? "",
      city: candidate?.city ?? "",
      zip: candidate?.zip ?? "",
      phone: candidate?.phone ?? "",
      email: candidate?.email ?? "",
      addressComplement: candidate?.addressComplement ?? "",
    },
  });

  const country = watch("country");
  const [disabledDepartment, setDisabledDepartment] = useState(
    country !== "France",
  );

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
        countryIsFrance: candidate.country?.id === franceId,
        gender: (candidate.gender as GenderEnum) ?? GenderEnum.undisclosed,
        nationality: candidate.nationality ?? "",
        street: candidate.street ?? "",
        city: candidate.city ?? "",
        zip: candidate.zip ?? "",
        phone: candidate.phone ?? "",
        email: candidate.email ?? "",
        addressComplement: candidate.addressComplement ?? "",
      });
    },
    [reset, franceId],
  );
  useEffect(() => {
    resetFormData(candidate as Candidate);
  }, [candidate, resetFormData]);

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

  const onSubmit = async (data: FormCandidateInformationData) => {
    const candidateInformation: CandidateUpdateInformationInput = {
      id: candidacy?.candidate?.id,
      firstname: data.firstname,
      firstname2: data.firstname2,
      firstname3: data.firstname3,
      lastname: data.lastname,
      givenName: data.givenName,
      birthCity: data.birthCity,
      nationality: data.nationality,
      gender: data.gender as GenderEnum,
      countryId: data.country,
      birthdate: new Date(data.birthdate).getTime(),
      birthDepartmentId: data.birthDepartment,
      street: data.street,
      zip: data.zip,
      city: data.city,
      phone: data.phone,
      email: data.email,
      addressComplement: data.addressComplement,
    };

    try {
      await updateCandidateInformationMutate({
        candidateInformation,
      });
      successToast("Les informations ont bien été mises à jour");

      await queryClient.invalidateQueries({
        queryKey: [candidacyId],
      });
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const handleOnAddressSelection = ({
    street,
    zip,
    city,
  }: {
    street: string;
    zip: string;
    city: string;
  }) => {
    setValue("street", street, { shouldDirty: true });
    setValue("zip", zip, { shouldDirty: true });
    setValue("city", city, { shouldDirty: true });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onReset={(e) => {
          e.preventDefault();
          resetFormData(candidate as Candidate);
        }}
        className="flex flex-col gap-6"
      >
        <h6 className="mb-0 text-xl font-bold">Informations civiles</h6>
        <div className="flex gap-6">
          <Select
            label="Civilité"
            className="w-full"
            nativeSelectProps={register("gender")}
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
            nativeInputProps={register("lastname")}
            state={errors.lastname ? "error" : "default"}
            stateRelatedMessage={errors.lastname?.message}
          />
          <Input
            label="Nom d'usage (optionnel)"
            className="w-full"
            nativeInputProps={register("givenName")}
          />
        </div>
        <div className="flex gap-6">
          <Input
            label="Prénom principal"
            className="w-full"
            nativeInputProps={register("firstname")}
            state={errors.firstname ? "error" : "default"}
            stateRelatedMessage={errors.firstname?.message}
          />
          <Input
            label="Prénom 2 (optionnel)"
            className="w-full"
            nativeInputProps={register("firstname2")}
          />
          <Input
            label="Prénom 3 (optionnel)"
            className="w-full"
            nativeInputProps={register("firstname3")}
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
            nativeSelectProps={register("country")}
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
            nativeSelectProps={register("birthDepartment")}
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
            nativeInputProps={register("birthCity")}
            state={errors.birthCity ? "error" : "default"}
            stateRelatedMessage={errors.birthCity?.message}
          />
        </div>
        <div className="flex gap-6">
          <Input
            label="Nationalité"
            className="w-full"
            nativeInputProps={register("nationality")}
            state={errors.nationality ? "error" : "default"}
            stateRelatedMessage={errors.nationality?.message}
          />
        </div>
        <h6 className="mb-0 text-xl font-bold">Informations de contact</h6>
        <div className="flex gap-4">
          <AutocompleteAddress
            onOptionSelection={handleOnAddressSelection}
            className="w-full flex-1"
          />
          <Input
            label="Complément d'adresse (Optionnel)"
            className="w-full flex-1"
            nativeInputProps={register("addressComplement")}
            state={errors.addressComplement ? "error" : "default"}
            stateRelatedMessage={errors.addressComplement?.message}
          />
        </div>

        <Checkbox
          options={[
            {
              label: "Je ne trouve pas mon adresse",
              nativeInputProps: {
                checked: completeAddressSelected,
                onChange: (e) => setCompleteAddressSelected(e.target.checked),
              },
            },
          ]}
        />

        {completeAddressSelected && (
          <div className="flex gap-4">
            <Input
              label="Numéro et nom de rue"
              className="w-full flex-[3]"
              nativeInputProps={register("street")}
              state={errors.street ? "error" : "default"}
              stateRelatedMessage={errors.street?.message}
            />
            <Input
              label="Code postal"
              className="w-full flex-1"
              nativeInputProps={register("zip")}
              state={errors.zip ? "error" : "default"}
              stateRelatedMessage={errors.zip?.message}
            />
            <Input
              label="Ville"
              className="w-full flex-[2]"
              nativeInputProps={register("city")}
              state={errors.city ? "error" : "default"}
              stateRelatedMessage={errors.city?.message}
            />
          </div>
        )}
        <div className="flex gap-4">
          <Input
            label="Numéro de téléphone"
            className="w-full"
            nativeInputProps={register("phone")}
            state={errors.phone ? "error" : "default"}
            stateRelatedMessage={errors.phone?.message}
          />
          <Input
            label="Email"
            className="w-full"
            nativeInputProps={register("email")}
            state={errors.email ? "error" : "default"}
            stateRelatedMessage={errors.email?.message}
          />
        </div>
        <FormButtons
          backUrl={`/candidacies/${candidacyId}/summary`}
          formState={formState}
        />
      </form>
    </>
  );
};

export default CandidateInformationForm;
