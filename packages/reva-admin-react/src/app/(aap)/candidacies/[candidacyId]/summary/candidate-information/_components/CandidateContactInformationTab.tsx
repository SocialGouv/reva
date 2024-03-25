import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";

import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import {
  Candidate,
  CandidateContactInformationInput,
} from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import useCandidateSummary from "../../_components/useCandidateSummary";
import {
  FormCandidateContactInformationData,
  candidateContactInformationSchema,
} from "./candidateContactInformationSchema";
import useUpdateCandidateContactInformation from "./useUpdateCandidateContactInformation.hook";

const CandidateContactInformationTab = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { candidacy, getCandidacyRefetch } = useCandidateSummary(candidacyId);
  const candidate = candidacy?.candidate;

  const { updateCandidateContactInformationMutate } =
    useUpdateCandidateContactInformation(candidacyId);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormCandidateContactInformationData>({
    resolver: zodResolver(candidateContactInformationSchema),
    defaultValues: {
      street: "",
      city: "",
      zip: "",
      phone: "",
      email: "",
    },
  });

  const resetFormData = useCallback(
    (candidate: Candidate) => {
      if (!candidate) return;
      reset({
        street: candidate.street ?? "",
        city: candidate.city ?? "",
        zip: candidate.zip ?? "",
        phone: candidate.phone ?? "",
        email: candidate.email ?? "",
      });
    },
    [reset],
  );
  useEffect(() => {
    resetFormData(candidate as Candidate);
  }, [candidate, resetFormData]);

  const onSubmit = async (data: FormCandidateContactInformationData) => {
    const candidateContactInformation: CandidateContactInformationInput = {
      id: candidacy?.candidate?.id,
      city: data.city,
      email: data.email,
      phone: data.phone,
      street: data.street,
      zip: data.zip,
    };

    try {
      await updateCandidateContactInformationMutate({
        candidateContactInformation,
      });
      successToast("Les informations ont bien été mises à jour");
      await getCandidacyRefetch();
    } catch (e) {
      graphqlErrorToast(e);
    }
  };
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

export default CandidateContactInformationTab;
