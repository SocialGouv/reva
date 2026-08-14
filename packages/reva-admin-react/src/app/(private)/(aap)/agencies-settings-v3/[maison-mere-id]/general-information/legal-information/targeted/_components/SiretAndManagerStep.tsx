import Input from "@codegouvfr/react-dsfr/Input";
import { toDate } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";

import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { CompanyBadges } from "@/components/company-preview/CompanyPreview.component";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { formatSiret } from "@/utils/formatSiret";

import {
  Etablissement,
  GeneralInformationFormValues,
} from "../../../generalInformationPage.hook";

const InfoRow = ({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex items-center gap-6 border-b border-neutral-300 py-2 px-4 text-dsfrGray-labelGrey ${className || ""}`}
  >
    <div>{label}</div>
    <div className="font-bold flex-1 text-right">{children}</div>
  </div>
);

const SiretInformationCard = ({
  siret,
  etablissement,
}: {
  siret: string;
  etablissement: Etablissement;
}) => (
  <GrayCard as="div" className="min-h-[220px]">
    <h2>Informations liées au SIRET - {formatSiret(siret)}</h2>
    {etablissement && (
      <>
        <CompanyBadges
          className="mb-4"
          siegeSocial={etablissement.siegeSocial}
          dateFermeture={
            etablissement.dateFermeture
              ? toDate(etablissement.dateFermeture)
              : null
          }
          qualiopiStatus={!!etablissement.qualiopiStatus}
        />
        <InfoRow label="Raison sociale" className="border-t">
          {etablissement.raisonSociale}
        </InfoRow>
        <InfoRow label="Forme juridique">
          {etablissement.formeJuridique.libelle}
        </InfoRow>
        <div className="flex items-center justify-between gap-4 mt-6">
          <SmallNotice>
            Les informations affichées ci-dessus ne sont pas modifiables. Elles
            sont issues de l'annuaire des entreprises via votre numéro de SIRET.
          </SmallNotice>
          <Image
            className="shrink-0"
            src="/admin2/logos/annuaire-des-entreprises.svg"
            alt="L'Annuaire des Entreprises"
            width={90}
            height={40}
          />
        </div>
      </>
    )}
  </GrayCard>
);

export const SiretAndManagerStep = ({
  formHook: {
    register,
    watch,
    formState: { errors },
  },
  etablissement,
  siretIsSelected,
  managerIsSelected,
}: {
  formHook: UseFormReturn<GeneralInformationFormValues>;
  etablissement: Etablissement;
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
          state={errors.siret ? "error" : "default"}
          stateRelatedMessage={errors.siret?.message}
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
    <SiretInformationCard
      siret={watch("siret")}
      etablissement={etablissement}
    />
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
