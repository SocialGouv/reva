"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { useMemo } from "react";

import { ConformiteNormeAccessibilite } from "@/graphql/generated/graphql";

import OrganismInformationForm from "../../../_components/OrganismInformationForm";
import { OrganismInformationOutputData } from "../../../_components/organismInformationFormSchema";

import { useOrganismInformationOnSite } from "./organismInformationOnSite.hook";

const InformationsOnSitePage = () => {
  const {
    organism,
    organismId,
    createOrUpdateInformationsCommerciales,
    maisonMereAAPId,
    isAdmin,
  } = useOrganismInformationOnSite();
  const handleSubmit = async (data: OrganismInformationOutputData) => {
    await createOrUpdateInformationsCommerciales({
      ...data,
      conformeNormesAccessibilite:
        data.conformeNormesAccessibilite as ConformiteNormeAccessibilite,
    });
  };

  const organismName = organism?.nomPublic || organism?.label;

  const defaultData = useMemo(
    () => ({
      adresseNumeroEtNomDeRue: organism?.adresseNumeroEtNomDeRue ?? "",
      adresseInformationsComplementaires:
        organism?.adresseInformationsComplementaires ?? "",
      adresseCodePostal: organism?.adresseCodePostal ?? "",
      adresseVille: organism?.adresseVille ?? "",
      nomPublic: organism?.nomPublic ?? "",
      telephone: organism?.telephone ?? "",
      siteInternet: organism?.siteInternet ?? "",
      emailContact: organism?.emailContact ?? "",
      conformeNormesAccessibilite: organism?.conformeNormesAccessibilite,
    }),
    [organism],
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
