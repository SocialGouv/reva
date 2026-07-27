"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

import { useAuth } from "@/components/auth/auth";

import { FormacodesForm } from "../../../_components/formacodes-form/FormacodesForm";
import { useOnRemoteOrganism } from "../../../on-site/_components/onRemoteOrganism.hook";

const PerimetreAccompagnementOnSitePage = () => {
  const { isAdmin } = useAuth();
  const { organism } = useOnRemoteOrganism();

  return (
    <div className="flex flex-col">
      <Breadcrumb
        className="mb-2"
        currentPageLabel="Formacode"
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
              href: `../../`,
            },
          },
          {
            label: "Périmètre d’accompagnement",
            linkProps: {
              href: `../`,
            },
          },
        ]}
      />
      <h1>Périmètre d’accompagnement via le Formacode</h1>

      <FormacodesForm organismId={organism?.id} />
    </div>
  );
};

export default PerimetreAccompagnementOnSitePage;
