"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

import { useAuth } from "@/components/auth/auth";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import PerimetreAccompagnementForm from "../../_components/perimetre-accompagnement-form/PerimetreAccompagnementForm";
import { useOnRemoteOrganism } from "../../on-site/_components/onRemoteOrganism.hook";

const PerimetreAccompagnementOnSitePage = () => {
  const { isAdmin } = useAuth();
  const { organism } = useOnRemoteOrganism();

  return (
    <div className="flex flex-col">
      <Breadcrumb
        className="mb-2"
        currentPageLabel="Périmètre d’accompagnement"
        segments={[
          isAdmin
            ? {
                label: organism?.maisonMereAAP?.raisonSociale,
                linkProps: {
                  href: `/maison-mere-aap/${organism?.maisonMereAAP?.id}`,
                },
              }
            : {
                label: "Paramètres",
                linkProps: { href: "/agencies-settings-v3" },
              },
          {
            label: "Accompagnement à distance",
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

      <PerimetreAccompagnementForm
        organismId={organism?.id}
        backButtonUrl={`../`}
      />
    </div>
  );
};

export default PerimetreAccompagnementOnSitePage;
