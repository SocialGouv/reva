"use client";
import { CertificationAuthorityStructureBreadcrumb } from "../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import { useCertificationAuthority } from "./certificationAuthority.hooks";
import Input from "@codegouvfr/react-dsfr/Input";
import CandidacySectionCard from "@/components/card/candidacy-section-card/CandidacySectionCard";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

const CertificationAuthorityAdminsPage = () => {
  const router = useRouter();
  const {
    certificationAuthority,
    getCertificationAuthorityStatus,
    domainsAndCertifications,
  } = useCertificationAuthority();

  if (
    !certificationAuthority ||
    !domainsAndCertifications ||
    getCertificationAuthorityStatus !== "success"
  ) {
    return null;
  }

  const isInterventionAreaComplete = certificationAuthority.regions.length > 0;
  const isDomainsAndCertificationsComplete = Object.keys(domainsAndCertifications).length > 0;

  return (
    <div className="flex flex-col flex-1">
      <CertificationAuthorityStructureBreadcrumb
        certificationAuthorityStructureId={
          certificationAuthority.certificationAuthorityStructure.id
        }
        certificationAuthorityStructureLabel={
          certificationAuthority.certificationAuthorityStructure.label
        }
        pageLabel={certificationAuthority.label}
      />
      <h1>{certificationAuthority.label}</h1>
      <p className="text-xl">
        Il s’occupe des candidatures (dossier de validation, jury...) et peut
        ajouter des comptes collaborateurs. L’ajout d’un certificateur
        administrateur est obligatoire pour la gestion des candidatures.
      </p>
      <div className="flex flex-col gap-y-6">
        <form>
          <div className="grid grid-cols-2 w-full gap-x-4">
            <Input
              label="Nom de la structure"
              className="col-span-2"
              nativeInputProps={{
                defaultValue: certificationAuthority.label,
              }}
            />
            <Input
              label="Nom du certificateur"
              nativeInputProps={{
                defaultValue: certificationAuthority.contactFullName ?? "",
              }}
            />
            <Input
              label="Email de connexion"
              nativeInputProps={{
                defaultValue: certificationAuthority.contactEmail ?? "",
              }}
            />
          </div>
        </form>
        <CandidacySectionCard
          title="Zone d'intervention"
          titleIconClass="fr-icon-road-map-fill"
          hasButton
          buttonTitle="Modifier"
          buttonPriority="secondary"
          buttonOnClick={() => {
            router.push(`/certification-authorities/${certificationAuthority.id}`);
          }}
          badge={
            <Badge
              severity={
                isInterventionAreaComplete
                  ? "success"
                  : "warning"
              }
            >
              {isInterventionAreaComplete
                ? "Complet"
                : "À compléter"}
            </Badge>
          }
        >
          {certificationAuthority.regions.map((r) => (
            <Accordion label={r.label} key={r.id}>
              <ul>
                {r.departments.map((d) => (
                  <li key={d.id}>{d.label}</li>
                ))}
              </ul>
            </Accordion>
          ))}
        </CandidacySectionCard>
        <CandidacySectionCard
          title="Certifications gérées"
          titleIconClass="fr-icon-award-fill"
          hasButton
          buttonTitle="Modifier"
          buttonPriority="secondary"
          buttonOnClick={() => {
            router.push(`/certification-authorities/${certificationAuthority.id}`);
          }}
          badge={
            <Badge
              severity={
                isDomainsAndCertificationsComplete
                  ? "success"
                  : "warning"
              }
            >
              {isDomainsAndCertificationsComplete
                ? "Complet"
                : "À compléter"}
            </Badge>
          }
        >
          <Badge severity="info" className="mb-4 uppercase">{certificationAuthority.certifications.length} certifications gérées</Badge>
          <p className="font-bold">Domaines rattachés</p>
          {Object.entries(domainsAndCertifications).map(
            ([domainId, certifications]) => (
              <Accordion
                label={certifications[0].domaines[0].label}
                key={domainId}
              >
                <ul>
                  {certifications.map((c) => (
                    <li key={c.id}>{c.label}</li>
                  ))}
                </ul>
              </Accordion>
            ),
          )}
        </CandidacySectionCard>
        <CandidacySectionCard
          title="Compte collaborateurs"
          titleIconClass="fr-icon-team-fill"
        >
          <ul className="list-none font-bold">
            {certificationAuthority.certificationAuthorityLocalAccounts.map(
              ({ account }) => (
                <li
                  key={account.id}
                  className="flex items-center justify-between pt-4 pb-3 border-neutral-300 border-t last:border-b"
                >
                  <div className="flex flex-col">
                    <span>
                      {account.firstname} {account.lastname}
                    </span>
                    <span className="font-normal">{account.email}</span>
                  </div>
                  <span>
                    <Button
                      priority="tertiary"
                      linkProps={{
                        href: `/accounts/${account.id}`,
                      }}
                    >
                      Visualiser
                    </Button>
                  </span>
                </li>
              ),
            )}
          </ul>
        </CandidacySectionCard>
      </div>
    </div>
  );
};

export default CertificationAuthorityAdminsPage;
