"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import DomainesCcnsDegreesForm from "../../_components/domaines-ccns-degrees-form/DomainesCcnsDegreesForm";
import { useOnSiteOrganism } from "../_components/onSiteOrganism.hook";

const DomainesCcnsDegreesOnSitePage = () => {
  const { organismId, organismName, maisonMereAAPId } = useOnSiteOrganism();

  return (
    <div className="flex flex-col">
      <Breadcrumb
        currentPageLabel="Filières, branches et niveaux"
        homeLinkProps={{
          href: `/`,
        }}
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/agencies-settings-v3" },
          },
          {
            label: organismName,
            linkProps: {
              href: `/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/on-site`,
            },
          },
        ]}
      />
      <h1>Filières, branches et niveaux</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Sélectionnez toutes les filières, branches et niveaux gérés par votre
        structure.
      </p>
      <DomainesCcnsDegreesForm
        organismId={organismId}
        backButtonUrl={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/on-site`}
      />
    </div>
  );
};

export default DomainesCcnsDegreesOnSitePage;
