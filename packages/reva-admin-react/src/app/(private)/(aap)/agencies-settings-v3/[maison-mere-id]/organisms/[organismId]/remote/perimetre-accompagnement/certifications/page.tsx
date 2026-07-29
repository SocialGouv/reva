"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

import { useAuth } from "@/components/auth/auth";

import { Certifications } from "../../../_components/certifications/Certifications";
import { useOnRemoteOrganism } from "../../../on-site/_components/onRemoteOrganism.hook";

const CertificationsOnRemotePage = () => {
  const { isAdmin } = useAuth();
  const { organism } = useOnRemoteOrganism();

  return (
    <div className="flex flex-col flex-1">
      <Breadcrumb
        className="mb-2"
        currentPageLabel="Certifications"
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
      <h1>Certifications</h1>

      <Certifications organismId={organism?.id} />
    </div>
  );
};

export default CertificationsOnRemotePage;
