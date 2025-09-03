"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Tag from "@codegouvfr/react-dsfr/Tag";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

import { useLocalAccountSettingsPage } from "./localAccountSettingsPage.hook";

export default function LocalAccountSettingsPage() {
  const { certificationAuthorityLocalAccount } = useLocalAccountSettingsPage();

  const certificationsCount =
    certificationAuthorityLocalAccount?.certifications?.length;
  const regionsAndDepartments: {
    id: string;
    label: string;
    departments: { id: string; label: string; code: string }[];
  }[] = [];
  certificationAuthorityLocalAccount?.departments.forEach((department) => {
    if (department.region) {
      let region = regionsAndDepartments.find(
        (r) => r.id === department.region?.id,
      );
      if (!region) {
        region = {
          id: department.region.id,
          label: department.region.label,
          departments: [],
        };
        regionsAndDepartments.push(region);
      }
      region.departments.push(department);
    }
  });

  return (
    <div className="flex flex-col" data-test="local-account-settings-page">
      <h1>Paramètres</h1>
      <p className="mb-12">
        Retrouvez l'ensemble des informations liées à ce compte local. Pour
        toute modification, rapprochez vous de votre gestionnaire de
        candidatures.
      </p>
      <div className="w-full flex flex-col gap-8">
        <EnhancedSectionCard
          data-test="local-account-general-information-summary-card"
          title="Informations générales"
          titleIconClass="fr-icon-information-fill"
          isEditable
          buttonOnClickHref="/certification-authorities/settings/local-account/general-information"
        >
          <div className="pl-10">
            {certificationAuthorityLocalAccount?.contactFullName ? (
              <div className="flex gap-x-2">
                <p>Contact référent :</p>
                <div>
                  <p className="my-0 font-medium" data-test="contact-full-name">
                    {certificationAuthorityLocalAccount?.contactFullName}
                  </p>
                  <p className="my-0 font-medium" data-test="contact-email">
                    {certificationAuthorityLocalAccount?.contactEmail}
                  </p>
                </div>
              </div>
            ) : (
              <Badge severity="new" small data-test="no-contact-details-badge">
                Aucun contact référent
              </Badge>
            )}
          </div>
        </EnhancedSectionCard>
        <EnhancedSectionCard
          data-test="intervention-area-summary-card"
          title="Zone d'intervention"
          titleIconClass="fr-icon-road-map-fill"
          isEditable={false}
          status={
            regionsAndDepartments.length > 0 ? "COMPLETED" : "TO_COMPLETE"
          }
        >
          {regionsAndDepartments.map((r) => (
            <Accordion label={r.label} key={r.id}>
              <div className="flex flex-wrap gap-2">
                {r.departments.map((d) => (
                  <Tag key={d.id} data-test={`department-tag-${d.code}`}>
                    {d.label} ({d.code})
                  </Tag>
                ))}
              </div>
            </Accordion>
          ))}
        </EnhancedSectionCard>
        <EnhancedSectionCard
          data-test="certifications-summary-card"
          title="Certifications gérées"
          titleIconClass="fr-icon-award-fill"
          isEditable
          buttonOnClickHref="/certification-authorities/settings/local-account/certifications"
          customButtonTitle="Consulter"
        >
          {certificationsCount ? (
            <div className="flex flex-col gap-6">
              <Badge
                className="bg-[#FEE7FC] text-[#6E445A]"
                data-test="certifications-count-badge"
              >
                {certificationsCount} certifications gérées
              </Badge>
            </div>
          ) : null}
        </EnhancedSectionCard>
      </div>
    </div>
  );
}
