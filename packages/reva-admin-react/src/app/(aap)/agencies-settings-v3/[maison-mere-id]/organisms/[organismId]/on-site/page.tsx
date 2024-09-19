"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Highlight } from "@codegouvfr/react-dsfr/Highlight";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Link from "next/link";
import { OrganismVisibilityToggle } from "../_components/organism-visibility-toggle/OrganismVisibilityToggle";
import { useOnSiteOrganism } from "./_components/onSiteOrganism.hook";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

export default function RemotePage() {
  const { isFeatureActive } = useFeatureflipping();

  const { organism, organismId, organismName, maisonMereAAPId } =
    useOnSiteOrganism();

  if (!organism) return null;

  const isDomainAndLevelsComplete =
    organism.managedDegrees?.[0] &&
    (organism.domaines?.[0] || organism.conventionCollectives?.[0]);

  const isFormacodesAndLevelsComplete =
    organism?.managedDegrees?.[0] &&
    (organism?.formacodes?.[0] || organism?.conventionCollectives?.[0]);

  const isAgencyInformationComplete =
    organism.informationsCommerciales?.nom &&
    organism.informationsCommerciales?.adresseNumeroEtNomDeRue &&
    organism.informationsCommerciales?.adresseVille &&
    organism.informationsCommerciales?.adresseCodePostal;
  organism.informationsCommerciales?.telephone &&
    organism.informationsCommerciales?.emailContact;

  const isFormacodeEnabled = isFeatureActive("AAP_SETTINGS_FORMACODE");

  return (
    <div className="flex flex-col w-full">
      <Breadcrumb
        currentPageLabel={organismName}
        homeLinkProps={{
          href: `/`,
        }}
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/agencies-settings-v3" },
          },
        ]}
      />

      <h1>{organismName}</h1>
      <p>
        Pour être visible complétez tout et mettez l'interrupteur sur visible.
      </p>
      <div className="flex flex-col gap-6">
        <EnhancedSectionCard
          title="Informations affichées aux candidats"
          titleIconClass="fr-icon-information-fill"
          isEditable
          status={isAgencyInformationComplete ? "COMPLETED" : "TO_COMPLETE"}
          buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/on-site/information`}
        >
          <div className="flex flex-col gap-2">
            <div className="font-bold">
              {organism.informationsCommerciales?.nom}
            </div>
            <div>
              {organism.informationsCommerciales?.adresseNumeroEtNomDeRue}{" "}
              {organism.informationsCommerciales?.adresseCodePostal}{" "}
              {organism.informationsCommerciales?.adresseVille}
              <br />
              {organism.informationsCommerciales
                ?.adresseInformationsComplementaires && (
                <>
                  {
                    organism.informationsCommerciales
                      ?.adresseInformationsComplementaires
                  }
                  <br />
                </>
              )}
              {organism.informationsCommerciales?.telephone}{" "}
              {organism.informationsCommerciales?.emailContact}
            </div>
            {organism.informationsCommerciales?.siteInternet && (
              <Link
                className="fr-link mr-auto"
                target="_blank"
                href={organism.informationsCommerciales?.siteInternet}
              >
                Site internet
              </Link>
            )}
            {organism.informationsCommerciales?.conformeNormesAccessbilite && (
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
        {isFormacodeEnabled ? (
          <EnhancedSectionCard
            title="Domaines, branches et niveaux"
            titleIconClass="fr-icon-award-fill"
            isEditable
            buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/on-site/formacodes-ccns-degrees`}
            status={isFormacodesAndLevelsComplete ? "COMPLETED" : "TO_COMPLETE"}
          >
            {organism.formacodes?.[0] && (
              <Accordion label="Domaines" defaultExpanded>
                <div className="flex flex-wrap gap-2">
                  {organism.formacodes?.map((formacode) => (
                    <Tag key={formacode.code}>{formacode.label}</Tag>
                  ))}
                </div>
              </Accordion>
            )}
            {organism.conventionCollectives?.[0] && (
              <Accordion label="Branches">
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
                    <Tag key={d.id}>{d.degree.label}</Tag>
                  ))}
                </div>
              </Accordion>
            )}
          </EnhancedSectionCard>
        ) : (
          <EnhancedSectionCard
            title="Filières, branches et niveaux"
            titleIconClass="fr-icon-award-fill"
            isEditable
            buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/on-site/domaines-ccns-degrees`}
            status={isDomainAndLevelsComplete ? "COMPLETED" : "TO_COMPLETE"}
          >
            {organism.domaines?.[0] && (
              <Accordion label="Filières">
                <div className="flex flex-wrap gap-2">
                  {organism.domaines?.map((d) => (
                    <Tag key={d.id}>{d.label}</Tag>
                  ))}
                </div>
              </Accordion>
            )}
            {organism.conventionCollectives?.[0] && (
              <Accordion label="Branches">
                <div className="flex flex-wrap gap-2">
                  {organism.conventionCollectives?.map((ccn) => (
                    <Tag key={ccn.id}>{ccn.label}</Tag>
                  ))}
                </div>
              </Accordion>
            )}
            {organism.managedDegrees?.[0] && (
              <Accordion label="Niveaux">
                <div className="flex flex-wrap gap-2">
                  {organism.managedDegrees?.map((d) => (
                    <Tag key={d.id}>{d.degree.label}</Tag>
                  ))}
                </div>
              </Accordion>
            )}
          </EnhancedSectionCard>
        )}
        <div className="flex flex-col mt-6">
          <h2>Visibilité de la structure</h2>
          <OrganismVisibilityToggle organismId={organismId} />
        </div>
      </div>
    </div>
  );
}
