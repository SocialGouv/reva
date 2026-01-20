import Alert from "@codegouvfr/react-dsfr/Alert";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import {
  AVAILABLE_CANDIDATE_TYPOLOGIES,
  getTypologyLabel,
} from "@/utils/candidateTypology.util";

import {
  Candidate,
  CandidateUpdateTypologyAndCcnInput,
} from "@/graphql/generated/graphql";

import { CcnSearchList } from "./CcnSearchList";
import {
  TypologyFormData,
  typologyFormSchema,
} from "./typologyAndCollectiveAgreementSchema";
import {
  CandidateUseProfile,
  useUpdateCandidateTypologyAndCcn,
} from "./useTypologyAndCollectiveAgreement";

export const TypologyAndCollectiveAgreementForm = ({
  candidate,
  hideBackButton,
}: {
  candidate: CandidateUseProfile;
  hideBackButton?: boolean;
}) => {
  const { updateCandidateTypologyAndCcnMutate } =
    useUpdateCandidateTypologyAndCcn();
  const router = useRouter();

  const {
    register,
    setValue,
    reset,
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
  } = useForm<TypologyFormData>({
    resolver: zodResolver(typologyFormSchema),
    defaultValues: {
      ccnId: candidate?.conventionCollective?.id ?? "",
      typology:
        (candidate?.typology as TypologyFormData["typology"]) ?? "NON_SPECIFIE",
      additionalInformation: candidate?.typologyAdditional ?? "",
    },
  });

  const resetFormData = useCallback(
    (candidate: Candidate) => {
      reset({
        ccnId: candidate.conventionCollective?.id ?? "",
        typology:
          (candidate?.typology as TypologyFormData["typology"]) ??
          "NON_SPECIFIE",
        additionalInformation: candidate.typologyAdditional ?? "",
      });
    },
    [reset],
  );

  useEffect(() => {
    resetFormData(candidate as Candidate);
  }, [candidate, resetFormData]);

  const onSubmit = async (data: TypologyFormData) => {
    const candidateTypologyAndCcn: CandidateUpdateTypologyAndCcnInput = {
      ccnId: data.ccnId,
      typology: data.typology,
      additionalInformation: data.additionalInformation,
    };

    try {
      await updateCandidateTypologyAndCcnMutate({
        candidateId: candidate?.id,
        candidateTypologyAndCcn,
      });
      successToast("Les informations ont bien été mises à jour");
      router.push("../");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const { typology } = useWatch({ control });

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onReset={(e) => {
          e.preventDefault();
          resetFormData(candidate as Candidate);
        }}
        className="flex flex-col gap-6"
        data-testid="contact-information-form"
      >
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3 flex flex-col">
            <Select
              className="w-full"
              label="Typologie"
              nativeSelectProps={{ ...register("typology") }}
            >
              <option value="NON_SPECIFIE" disabled>
                Sélectionner
              </option>

              {AVAILABLE_CANDIDATE_TYPOLOGIES.map((typology) => (
                <option key={typology} value={typology}>
                  {getTypologyLabel(typology)}
                </option>
              ))}
            </Select>

            {typology === "SALARIE_PRIVE" ||
            typology === "DEMANDEUR_EMPLOI" ||
            typology === "TRAVAILLEUR_NON_SALARIE" ||
            typology === "TITULAIRE_MANDAT_ELECTIF" ||
            typology === "AIDANTS_FAMILIAUX_AGRICOLES" ? (
              <>
                <CcnSearchList
                  conventionCollective={candidate?.conventionCollective}
                  onCcnButtonClick={(ccnId) => {
                    setValue("ccnId", ccnId, { shouldDirty: true });
                  }}
                />
              </>
            ) : (
              <Alert
                small
                severity="info"
                description="Cette typologie ne possède pas de convention collective. Passez à l’étape suivante."
              />
            )}
          </div>

          <div className="col-span-1">
            <div className="flex flex-col px-4 pt-6 bg-dsfr-light-decisions-background-background-alt-blue-france">
              <h6>Ressources :</h6>
              <div>
                <p className="font-bold mb-2">
                  Comment retrouver ma convention collective ?
                </p>
                <p>
                  Vous pouvez retrouver le nom et numéro de votre convention
                  collective sur votre dernier bulletin de paie ou sur votre
                  contrat de travail.
                </p>
                <p className="font-bold mb-2">
                  Je ne trouve pas ma convention collective
                </p>
                <p className="mb-0">
                  Vous pouvez utiliser les ressources disponibles :
                </p>

                <ul className="list-none p-0 mb-8">
                  <li>
                    <a
                      className="fr-link"
                      href="https://code.travail.gouv.fr/outils/convention-collective"
                      target="_blank"
                    >
                      Site du code du travail
                    </a>
                  </li>
                  <li>
                    <a
                      className="fr-link"
                      href="https://vae.gouv.fr/savoir-plus/articles/retrouver-ma-convention-collective-pour-france-vae"
                      target="_blank"
                    >
                      Article dédié de France VAE
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <FormButtons
          backUrl={hideBackButton ? undefined : "../"}
          formState={{ isDirty, isSubmitting }}
          data-testid="form-buttons"
        />
      </form>
    </>
  );
};
