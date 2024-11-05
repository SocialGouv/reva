"use client";

import { ConformiteNormeAccessibilite } from "@/graphql/generated/graphql";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { useMemo } from "react";
import OrganismInformationForm from "../../../_components/OrganismInformationForm";
import { OrganismInformationFormData } from "../../../_components/organismInformationFormSchema";
import { useOrganismInformationOnSite } from "./organismInformationOnSite.hook";

const InformationsOnSitePage = () => {
  const {
    organism,
    informationsCommerciales,
    organismId,
    createOrUpdateInformationsCommerciales,
    maisonMereAAPId,
    isAdmin,
  } = useOrganismInformationOnSite();
  const handleSubmit = async (data: OrganismInformationFormData) => {
    const input = {
      nom: data.nom,
      telephone: data.telephone,
      siteInternet: data.siteInternet,
      emailContact: data.emailContact,
      adresseNumeroEtNomDeRue: data.adresseNumeroEtNomDeRue,
      adresseInformationsComplementaires:
        data.adresseInformationsComplementaires,
      adresseCodePostal: data.adresseCodePostal,
      adresseVille: data.adresseVille,
      conformeNormesAccessbilite:
        data.conformeNormesAccessibilite as ConformiteNormeAccessibilite,
    };

    await createOrUpdateInformationsCommerciales(input);
  };

  const organismName =
    organism?.informationsCommerciales?.nom || organism?.label;

  const defaultData = useMemo(
    () => ({
      adresseNumeroEtNomDeRue:
        informationsCommerciales?.adresseNumeroEtNomDeRue ?? "",
      adresseInformationsComplementaires:
        informationsCommerciales?.adresseInformationsComplementaires ?? "",
      adresseCodePostal: informationsCommerciales?.adresseCodePostal ?? "",
      adresseVille: informationsCommerciales?.adresseVille ?? "",
      nom: informationsCommerciales?.nom ?? "",
      telephone: informationsCommerciales?.telephone ?? "",
      siteInternet: informationsCommerciales?.siteInternet ?? "",
      emailContact: informationsCommerciales?.emailContact ?? "",
      conformeNormesAccessibilite:
        informationsCommerciales?.conformeNormesAccessbilite as OrganismInformationFormData["conformeNormesAccessibilite"],
    }),
    [informationsCommerciales],
  );
  if (!organism) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <Breadcrumb
        currentPageLabel={"Informations affichées au candidat"}
        homeLinkProps={{
          href: `/`,
        }}
        segments={[
          isAdmin
            ? {
                label: organism?.maisonMereAAP?.raisonSociale,
                linkProps: {
                  href: `/maison-mere-aap/${maisonMereAAPId}`,
                },
              }
            : {
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
      <OrganismInformationForm
        mutationOnSubmit={handleSubmit}
        pathRedirection={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/on-site`}
        defaultData={defaultData}
      />
    </div>
  );
};

export default InformationsOnSitePage;
