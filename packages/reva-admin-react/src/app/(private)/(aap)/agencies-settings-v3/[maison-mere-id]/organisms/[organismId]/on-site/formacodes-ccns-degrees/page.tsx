"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import FormacodesCcnsDegreesForm from "../../_components/formacodes-ccns-degrees-form/FormacodesCcnsDegreesForm";
import { useOnSiteOrganism } from "../_components/onSiteOrganism.hook";

const FormacodesCcnsDegreesOnSitePage = () => {
  const { organismId, organismName, maisonMereAAPId } = useOnSiteOrganism();

  return (
    <div className="flex flex-col">
      <Breadcrumb
        currentPageLabel="Domaines, branches et niveaux"
        segments={[
          {
            label: organismName,
            linkProps: {
              href: `../`,
            },
          },
        ]}
      />
      <h1>Domaines, branches et niveaux</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Sélectionnez les domaines, branches et niveaux gérés par ce lieu
        d’accueil. Pour information, les chiffres que vous retrouvez devant
        l’appellation des domaines sont ceux du formacode.
      </p>
      <a
        className="fr-link mr-auto"
        href="https://francevae.notion.site/Liste-des-certifications-actives-sur-France-VAE-1e3100b69ece8350ba8301830b7bb7c0"
        target="_blank"
      >
        Liste des certifications par sous-domaines et niveaux (dans France VAE)
      </a>
      <FormacodesCcnsDegreesForm
        organismId={organismId}
        backButtonUrl={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/on-site`}
      />
    </div>
  );
};

export default FormacodesCcnsDegreesOnSitePage;
