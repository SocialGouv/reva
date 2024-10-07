"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import FormacodesCcnsDegreesForm from "../../_components/formacodes-ccns-degrees-form/FormacodesCcnsDegreesForm";
import { useOnSiteOrganism } from "../_components/onSiteOrganism.hook";

const FormacodesCcnsDegreesOnSitePage = () => {
  const { organismId, organismName, maisonMereAAPId } = useOnSiteOrganism();

  return (
    <div className="flex flex-col">
      <Breadcrumb
        currentPageLabel="Domaines, branches et niveaux"
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
      <h1>Domaines, branches et niveaux</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Sélectionnez les domaines, branches et niveaux gérés par ce lieu
        d’accueil. Pour information, les chiffres que vous retrouvez devant
        l’appellation des domaines sont ceux du formacode.
      </p>
      <a
        className="fr-link mr-auto"
        href="https://fabnummas.notion.site/b1488dbfffa740908ae7b04e3294653a?v=fff653b7be07818fa5e1000c59999416"
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
