"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import { useOnSiteOrganism } from "../_components/onSiteOrganism.hook";

const PerimetreAccompagnementOnSitePage = () => {
  const { organismName } = useOnSiteOrganism();

  return (
    <div className="flex flex-col">
      <Breadcrumb
        currentPageLabel="Périmètre d’accompagnement"
        segments={[
          {
            label: organismName,
            linkProps: {
              href: `../`,
            },
          },
        ]}
      />
      <h1>Périmètre d’accompagnement</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Consultez et mettez à jour les domaines d'accompagnement et les niveaux
        gérés par cet organisme.
      </p>
    </div>
  );
};

export default PerimetreAccompagnementOnSitePage;
