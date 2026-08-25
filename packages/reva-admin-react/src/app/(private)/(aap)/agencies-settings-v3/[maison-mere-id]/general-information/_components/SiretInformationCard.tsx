import Alert from "@codegouvfr/react-dsfr/Alert";
import { toDate } from "date-fns";
import Image from "next/image";

import { GrayCard } from "@/components/card/gray-card/GrayCard";
import {
  CompanyBadges,
  EtablissementSkeleton,
} from "@/components/company-preview/CompanyPreview.component";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { formatSiret } from "@/utils/formatSiret";

import { GetEtablissementQuery } from "@/graphql/generated/graphql";

import { Etablissement } from "../generalInformationPage.hook";

import { InfoRow } from "./InfoRow";

// Présentationnel: chaque rôle interroge l'annuaire avec sa propre requête et passe le résultat.
export const SiretInformationCard = ({
  siret,
  etablissement,
  isLoading,
}: {
  siret: string;
  etablissement:
    | Etablissement
    | GetEtablissementQuery["getEtablissementAsAdmin"];
  isLoading?: boolean;
}) => (
  <GrayCard as="div">
    <h2>Informations liées au SIRET - {formatSiret(siret)}</h2>
    {isLoading && <EtablissementSkeleton />}
    {/* Recherche terminée et sans résultat: la carte resterait vide, sans rien dire. */}
    {!isLoading && !etablissement && siret?.length >= 14 && (
      <Alert
        className="mr-auto"
        severity="error"
        small
        description="Informations entreprise indisponibles"
      />
    )}
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
        <InfoRow label="Raison sociale">{etablissement.raisonSociale}</InfoRow>
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
