"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import FormacodesCcnsDegreesForm from "../../_components/formacodes-ccns-degrees-form/FormacodesCcnsDegreesForm";

const InformationsRemotePage = () => {
  const { organismId, "maison-mere-id": maisonMereAAPId } = useParams<{
    organismId: string;
    "maison-mere-id": string;
  }>();

  return (
    <div className="flex flex-col">
      <Breadcrumb
        currentPageLabel={"Domaines, branches et niveaux"}
        homeLinkProps={{
          href: `/`,
        }}
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/agencies-settings-v3" },
          },
          {
            label: "Accompagnement à distance",
            linkProps: {
              href: `/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/remote`,
            },
          },
        ]}
      />
      <h1>Domaines, branches et niveaux</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Sélectionnez les domaines, branches et niveaux gérés à distance. Pour
        information, les chiffres que vous retrouvez devant l’appellation des
        domaines sont ceux du formacode.
      </p>
      <a
        className="fr-link mr-auto"
        href="https://fabnummas.notion.site/Liste-des-certifications-actives-sur-France-VAE-19d653b7be0780ee80b0d72a3e7a127f"
        target="_blank"
      >
        Liste des certifications par sous-domaines et niveaux (dans France VAE)
      </a>
      <FormacodesCcnsDegreesForm
        organismId={organismId}
        backButtonUrl={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/remote`}
      />
    </div>
  );
};

export default InformationsRemotePage;
