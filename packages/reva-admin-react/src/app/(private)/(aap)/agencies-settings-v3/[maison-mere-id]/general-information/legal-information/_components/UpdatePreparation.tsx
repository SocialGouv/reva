import { Button } from "@codegouvfr/react-dsfr/Button";

import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";

import { LegalInformationBreadcrumb } from "./LegalInformationBreadcrumb";
import { LegalInformationTutorialHelp } from "./LegalInformationTutorialHelp";

export const UpdatePreparation = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  const generalInformationUrl = `/agencies-settings-v3/${maisonMereAAPId}/general-information`;

  return (
    <div className="flex flex-col w-full">
      <SettingsPageHeader
        breadcrumb={
          <LegalInformationBreadcrumb
            isAdmin={false}
            maisonMereAAPId={maisonMereAAPId}
          />
        }
        title="Mise à jour des informations générales"
      />
      <p>
        <LegalInformationTutorialHelp />
      </p>
      <p className="mt-6 mb-2">Veuillez vous munir :</p>
      <ul>
        <li>Du numéro de SIRET du siège social de la structure ;</li>
        <li>Du nom et prénom du dirigeant ;</li>
        <li>
          Du nom et prénom de l’administrateur du compte France VAE (s’il est
          différent du dirigeant) ;
        </li>
        <li>D’une adresse électronique servant à la connexion ;</li>
        <li>
          D’un numéro de téléphone sur lequel France VAE pourra vous joindre ;
        </li>
        <li>
          Ainsi que des documents suivants, requis pour tous les organismes :
          <ul>
            <li>
              Attestation URSSAF (attestation de vigilance ou attestation
              fiscale) ou attestation MSA qui comporte un code de sécurité ;
            </li>
            <li>Une copie du justificatif d'identité du dirigeant.</li>
          </ul>
        </li>
      </ul>
      <p className="font-bold mt-4 mb-2">
        Si l'administrateur du compte France VAE et le dirigeant sont des
        personnes différentes, ajoutez également :
      </p>
      <ul>
        <li>
          Une lettre de délégation signée par le dirigeant et le délégataire ;
        </li>
        <li>
          Une copie du justificatif d'identité de la personne ayant reçu
          délégation.
        </li>
      </ul>
      <p className="mt-4">
        Assurez-vous d'avoir ces documents en version numérique.
      </p>
      <div className="flex flex-wrap gap-4 justify-between mt-12">
        <Button
          priority="secondary"
          linkProps={{ href: generalInformationUrl }}
        >
          Retour
        </Button>
        <Button
          linkProps={{
            href: `${generalInformationUrl}/legal-information/targeted`,
          }}
        >
          Commencer la mise à jour
        </Button>
      </div>
    </div>
  );
};
