import Input from "@codegouvfr/react-dsfr/Input";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";

import { SiretInformationCard } from "../../../_components/SiretInformationCard";
import {
  Etablissement,
  GeneralInformationFormValues,
} from "../../../generalInformationPage.hook";

const SIRET_NOT_FOUND_MESSAGE =
  "Aucun établissement trouvé pour ce numéro de SIRET. Vérifiez le numéro saisi.";

export const SiretAndManagerStep = ({
  formHook: {
    register,
    watch,
    formState: { errors },
  },
  etablissement,
  etablissementIsFetching,
  siretNotFound,
  siretIsSelected,
  managerIsSelected,
}: {
  formHook: UseFormReturn<GeneralInformationFormValues>;
  etablissement: Etablissement;
  etablissementIsFetching: boolean;
  siretNotFound: boolean;
  siretIsSelected: boolean;
  managerIsSelected: boolean;
}) => (
  <>
    {siretIsSelected && (
      <div className="flex gap-6">
        <Input
          label="Numéro SIRET du siège social"
          hintText="14 chiffres"
          nativeInputProps={register("siret")}
          className="md:w-1/4"
          state={errors.siret || siretNotFound ? "error" : "default"}
          stateRelatedMessage={
            errors.siret?.message ??
            (siretNotFound ? SIRET_NOT_FOUND_MESSAGE : undefined)
          }
        />
        <div className="mr-auto self-end pb-6">
          <Link
            className="fr-link"
            href="https://annuaire-entreprises.data.gouv.fr"
            target="_blank"
          >
            Retrouvez votre numéro de SIRET sur l'Annuaire des Entreprises
          </Link>
        </div>
      </div>
    )}
    {!siretNotFound && (
      <SiretInformationCard
        siret={watch("siret")}
        etablissement={etablissement}
        isLoading={etablissementIsFetching}
      />
    )}
    {managerIsSelected && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Input
          label="Nom du (de la) dirigeant(e)"
          nativeInputProps={register("managerLastname")}
          state={errors.managerLastname ? "error" : "default"}
          stateRelatedMessage={errors.managerLastname?.message}
        />
        <Input
          label="Prénom(s) du (de la) dirigeant(e)"
          nativeInputProps={register("managerFirstname")}
          state={errors.managerFirstname ? "error" : "default"}
          stateRelatedMessage={errors.managerFirstname?.message}
        />
      </div>
    )}
  </>
);
