import {
  Candidate,
  CandidateCivilInformationInput,
} from "@/graphql/generated/graphql";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";

import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useCandidateSummary from "../../_components/useCandidateSummary";
import {
  FormCandidateCivilInformationData,
  GenderEnum,
  candidateCivilInformationSchema,
} from "./candidateCivilInformationSchema";
import useUpdateCandidateCivilInformation from "./useUpdateCandidateCivilInformation.hook";

const CandidateCivilInformationTab = ({
  handleOnSubmitNavigation,
}: {
  handleOnSubmitNavigation(): void;
}) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const queryClient = useQueryClient();

  const { candidacy, countries, departments, getCandidacyRefetch } =
    useCandidateSummary(candidacyId);
  const { updateCandidateCivilInformationMutate } =
    useUpdateCandidateCivilInformation(candidacyId);

  const candidate = candidacy?.candidate;
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
    formState: { errors },
    clearErrors,
    handleSubmit,
  } = useForm<FormCandidateCivilInformationData>({
    resolver: zodResolver(candidateCivilInformationSchema),
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
        socialSecurityNumber: candidate.socialSecurityNumber ?? "",
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

  const onSubmit = async (data: FormCandidateCivilInformationData) => {
    const candidateCivilInformation: CandidateCivilInformationInput = {
      id: candidacy?.candidate?.id,
      firstname: data.firstname,
      firstname2: data.firstname2,
      firstname3: data.firstname3,
      lastname: data.lastname,
      givenName: data.givenName,
      birthCity: data.birthCity,
      nationality: data.nationality,
      socialSecurityNumber: data.socialSecurityNumber,
      gender: data.gender as GenderEnum,
      countryId: data.country,
      birthdate: new Date(data.birthdate).getTime(),
      birthDepartmentId: data.birthDepartment,
    };

    try {
      await updateCandidateCivilInformationMutate({
        candidateCivilInformation,
      });
      successToast("Les informations ont bien été mises à jour");

      await queryClient.invalidateQueries({
        queryKey: [candidacyId],
      });

      handleOnSubmitNavigation();
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

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
      <div className="flex gap-6 justify-end">
        <Button
          priority="secondary"
          onClick={() => resetFormData(candidate as Candidate)}
        >
          Annuler
        </Button>
        <Button onClick={handleSubmit(onSubmit)}>Enregistrer</Button>
      </div>
    </>
  );
};

export default CandidateCivilInformationTab;
