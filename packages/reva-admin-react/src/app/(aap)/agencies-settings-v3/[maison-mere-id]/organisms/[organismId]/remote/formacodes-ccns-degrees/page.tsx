"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
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
        Sélectionnez les filières, branches et niveaux gérés par ce lieu
        d’accueil. Pour information, les chiffres que vous retrouvez devant
        l’appellation des domaines sont ceux du formacode RNCP.
      </p>
      <a
        className="fr-link mr-auto"
        href="https://fabnummas.notion.site/b1488dbfffa740908ae7b04e3294653a?v=fff653b7be07818fa5e1000c59999416"
        target="_blank"
      >
        Liste des certifications par sous-domaine et niveaux (dans France VAE)
      </a>
      <FormacodesCcnsDegreesForm
        organismId={organismId}
        backButtonUrl={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/remote`}
      />
    </div>
  );
};

export default InformationsRemotePage;
