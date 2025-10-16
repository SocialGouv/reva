"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Highlight } from "@codegouvfr/react-dsfr/Highlight";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Link from "next/link";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

import { OrganismVisibilityToggle } from "../_components/organism-visibility-toggle/OrganismVisibilityToggle";

import { useOnSiteOrganism } from "./_components/onSiteOrganism.hook";

export default function OnSitePage() {
  const { organism, organismId, organismName, maisonMereAAPId, isAdmin } =
    useOnSiteOrganism();
  if (!organism) return null;

  const isFormacodesAndLevelsComplete =
    organism?.managedDegrees?.[0] &&
    (organism?.formacodes?.[0] || organism?.conventionCollectives?.[0]);

  const isLieuAccueilInformationComplete =
    organism.nomPublic &&
    organism.adresseNumeroEtNomDeRue &&
    organism.adresseVille &&
    organism.adresseCodePostal &&
    organism.telephone &&
    organism.emailContact;

  return (
    <div className="flex flex-col w-full">
      <Breadcrumb
        currentPageLabel={organismName}
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
        ]}
      />

      <h1>{organismName}</h1>
      <p>
        Complétez et/ou modifiez les modalités d’accompagnement en présentiel de
        ce lieu d’accueil ainsi que les domaines, branches et niveaux gérés par
        celui-ci. Vous pouvez aussi changer la visibilité du lieu d’accueil dans
        les résultats de recherche des candidats.
      </p>
      <Alert
        className="mt-6 mb-8"
        severity="warning"
        small
        title="Ces modifications seront appliquées à tous les collaborateurs proposant des accompagnements sur ce lieu d'accueil."
        description=""
      />
      <div className="flex flex-col gap-6">
        <EnhancedSectionCard
          title="Informations affichées aux candidats"
          titleIconClass="fr-icon-information-fill"
          isEditable
          status={
            isLieuAccueilInformationComplete ? "COMPLETED" : "TO_COMPLETE"
          }
          buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/on-site/information`}
        >
          <div className="flex flex-col gap-2">
            <div className="font-bold">{organism.nomPublic}</div>
            <div>
              {organism.adresseNumeroEtNomDeRue} {organism.adresseCodePostal}{" "}
              {organism.adresseVille}
              <br />
              {organism.adresseInformationsComplementaires && (
                <>
                  {organism.adresseInformationsComplementaires}
                  <br />
                </>
              )}
              {organism.telephone} {organism.emailContact}
            </div>
            {organism.siteInternet && (
              <Link
                className="fr-link mr-auto"
                target="_blank"
                href={organism.siteInternet}
              >
                Site internet
              </Link>
            )}
            {organism.conformeNormesAccessibilite === "CONFORME" && (
              <Highlight
                classes={{
                  content: "mb-0",
                }}
              >
                Accessible PMR
              </Highlight>
            )}
          </div>
        </EnhancedSectionCard>
        <EnhancedSectionCard
          title="Domaines, branches, niveaux et certifications"
          titleIconClass="fr-icon-award-fill"
          isEditable
          buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/on-site/formacodes-ccns-degrees`}
          status={isFormacodesAndLevelsComplete ? "COMPLETED" : "TO_COMPLETE"}
        >
          {organism.formacodes?.[0] && (
            <Accordion label="Domaines" defaultExpanded>
              <div className="flex flex-wrap gap-2">
                {organism.formacodes?.map((formacode) => (
                  <Tag key={formacode.code}>
                    {`${formacode.code} ${formacode.label}`}
                  </Tag>
                ))}
              </div>
            </Accordion>
          )}
          {organism.conventionCollectives?.[0] && (
            <Accordion label="Branches" defaultExpanded>
              <div className="flex flex-wrap gap-2">
                {organism.conventionCollectives?.map((ccn) => (
                  <Tag key={ccn.id}>{ccn.label}</Tag>
                ))}
              </div>
            </Accordion>
          )}
          {organism.managedDegrees?.[0] && (
            <Accordion label="Niveaux" defaultExpanded>
              <div className="flex flex-wrap gap-2">
                {organism.managedDegrees?.map((d) => (
                  <Tag key={d.id}>Niveau {d.degree.level}</Tag>
                ))}
              </div>
            </Accordion>
          )}
          {organism.certifications?.[0] && (
            <Accordion label="Certifications" defaultExpanded>
              <div className="flex flex-col">
                {organism.certifications?.map((certification) => (
                  <Link
                    key={certification.id}
                    href={`/certification-details/${certification.id}`}
                    target="_blank"
                    className="py-2 text-sm bg-none text-dsfr-blue-france-sun-113 border-dsfr-light-decisions-border-border-default-grey border-b last:border-none"
                  >{`${certification.codeRncp} - ${certification.label}`}</Link>
                ))}
              </div>
            </Accordion>
          )}
        </EnhancedSectionCard>
        <div className="flex flex-col mt-6">
          <OrganismVisibilityToggle organismId={organismId} />
        </div>
      </div>
    </div>
  );
}
