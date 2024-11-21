"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useUpdateCertificationPage } from "./updateCertification.hook";
import { useParams, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { format } from "date-fns";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { SectionCard } from "@/components/card/section-card/SectionCard";
import Alert from "@codegouvfr/react-dsfr/Alert";

type CertificationForPage = Exclude<
  ReturnType<typeof useUpdateCertificationPage>["certification"],
  undefined
>;

export default function UpdateCertificationPage() {
  const { certificationId } = useParams<{
    certificationId: string;
  }>();

  const { certification, getCertificationQueryStatus } =
    useUpdateCertificationPage({ certificationId });
  return getCertificationQueryStatus === "success" && certification ? (
    <PageContent certification={certification} />
  ) : null;
}

const PageContent = ({
  certification,
}: {
  certification: CertificationForPage;
}) => {
  const router = useRouter();
  const structureSummaryCardComplete =
    !!certification.certificationAuthorityStructure;
  return (
    <div data-test="update-certification-page">
      <h1>{certification.label}</h1>
      <p className="mb-12 text-xl">
        Pour faciliter l’ajout, renseignez le code RNCP pour pré-remplir le
        document avec les informations de France compétences et du Formacode.
        Ensuite, vous pourrez renseigner une structure certificatrice et (à
        minima) un gestionnaire des candidatures.
      </p>
      <div className="flex flex-col gap-8">
        <EnhancedSectionCard
          data-test="certification-description-card"
          title="Descriptif de la certification"
          status="COMPLETED"
          isEditable
          titleIconClass="fr-icon-award-fill"
        >
          <div className="flex flex-col gap-4">
            <Info title="Code RNCP">{certification.codeRncp}</Info>
            <h3 className="mb-0">Descriptif de la certification</h3>
            <Info title="Intitulé">{certification.label}</Info>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info title="Niveau">{certification.degree.label}</Info>
              <Info title="Type">{certification.typeDiplome || ""}</Info>
              <Info title="Date d’échéance">
                {certification.rncpExpiresAt
                  ? format(certification.rncpExpiresAt, "dd/MM/yyyy")
                  : ""}
              </Info>
              <Info title="Date de dernière delivrance">
                {certification.rncpDeliveryDeadline
                  ? format(certification.rncpDeliveryDeadline, "dd/MM/yyyy")
                  : ""}
              </Info>
            </div>

            <h3 className="mb-0">Domaines et sous-domaines du Formacode </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certification.domains.length == 0 && (
                <div>Aucun formacode associé</div>
              )}
              {certification.domains.map((domain) => (
                <div key={domain.id} className="flex flex-col gap-2">
                  <div>{domain.label}</div>
                  <div
                    key={domain.id}
                    className="flex flex-row flex-wrap gap-2"
                  >
                    {domain.children.map((subDomain) => (
                      <Tag key={subDomain.id}>
                        {`${subDomain.code} ${subDomain.label}`}
                      </Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </EnhancedSectionCard>
        <SectionCard
          title="Blocs de compétences"
          data-test="competence-blocs-summary-card"
          titleIconClass="fr-icon-survey-fill"
          hasButton
          buttonPriority="tertiary no outline"
          buttonTitle="Ajouter un bloc de compétences"
          buttonIconId="fr-icon-add-line"
          buttonOnClick={() =>
            router.push(
              `/certifications-v2/${certification.id}/bloc-competence/add`,
            )
          }
        >
          <p>
            La modification de bloc est possible, mais doit rester
            exceptionnelle. Merci de l’utiliser uniquement en cas d’erreur
            importante à modifier (exemple : erreur sur l’intitulé).
          </p>

          <ul className="pl-0" data-test="competence-blocs-list">
            {certification.competenceBlocs.map((bloc) => (
              <li
                data-test="competence-bloc"
                className="flex items-start justify-between gap-6"
                key={bloc.id}
              >
                <Accordion
                  className="flex-1"
                  label={
                    bloc.code ? `${bloc.code} - ${bloc.label}` : bloc.label
                  }
                  defaultExpanded
                >
                  <ul data-test="competences-list">
                    {bloc.competences.map((competence) => (
                      <li key={competence.id}>{competence.label}</li>
                    ))}
                  </ul>
                </Accordion>
                <Button
                  data-test="update-competence-bloc-button"
                  priority="tertiary no outline"
                  linkProps={{
                    href: `/certifications-v2/${certification.id}/bloc-competence/${bloc.id}`,
                  }}
                >
                  Modifier
                </Button>
              </li>
            ))}
          </ul>
        </SectionCard>
        <EnhancedSectionCard
          data-test="certification-structure-summary-card"
          title="Structure certificatrice et gestionnaires"
          titleIconClass="fr-icon-group-fill"
          isEditable
          status={structureSummaryCardComplete ? "COMPLETED" : "TO_COMPLETE"}
          buttonOnClickHref={`/certifications-v2/${certification.id}/structure`}
        >
          {structureSummaryCardComplete && (
            <>
              <Info
                title="Structure certificatrice"
                data-test="certification-authority-structure-label"
              >
                {certification.certificationAuthorityStructure?.label}
              </Info>
              {!certification.certificationAuthorityStructure
                ?.certificationRegistryManager && (
                <Alert
                  data-test="no-certification-registry-manager-alert"
                  className="mt-4"
                  severity="warning"
                  title="Cette structure certificatrice n’a aucun responsable des certifications pour le moment"
                  description="Vous pouvez éditer et envoyer cette certification mais elle ne pourra être validée et publiée que par un responsable des certifications."
                />
              )}
              {certification.certificationAuthorityStructure
                ?.certificationAuthorities.length ? (
                <>
                  <h3 className="mt-4 mb-2">
                    Gestionnaires des candidatures liés à cette structure
                  </h3>
                  <ul
                    className="list-none"
                    data-test="certification-authority-list"
                  >
                    {certification.certificationAuthorityStructure?.certificationAuthorities?.map(
                      (ca) => (
                        <li
                          key={ca.id}
                          className="border-t border-light-decisions-border-border-default-grey font-bold pt-2 mb-1"
                        >
                          {ca.label}
                        </li>
                      ),
                    )}
                  </ul>
                </>
              ) : (
                <Alert
                  data-test="no-certification-authority-alert"
                  className="mt-4"
                  severity="warning"
                  title="Il n’y a pas de gestionnaire des candidatures pour cette certification"
                  description="Malgré cela, elle sera visible des candidats et des AAP dès sa validation par le responsable des certifications. Lors du premier dossier de faisabilité envoyé, et s’il n’y a toujours pas de gestionnaire des candidatures, le support sera averti du problème."
                />
              )}
            </>
          )}
        </EnhancedSectionCard>
      </div>
      <hr className="mt-8" />
      <h2>Validation par le responsable des certifications</h2>
      <p>
        Lorsque la certification est prête, vous devez l’envoyer au responsable
        des certifications pour validation. Si aucun responsable de
        certifications n’existe pour le moment et qu’aucune validation n’est
        possible, elle pourra être visible des AAP mais pas encore des
        candidats.
      </p>
      <hr className="mb-6" />
      <Button
        priority="secondary"
        linkProps={{ href: "/certifications-v2", target: "_self" }}
      >
        Retour
      </Button>
    </div>
  );
};

const Info = ({
  title,
  children,
  className,
  "data-test": dataTest,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  "data-test"?: string;
}) => (
  <dl data-test={dataTest} className={`${className || ""}`}>
    <dt className="mb-1">{title}</dt>
    <dd className="font-medium">{children}</dd>
  </dl>
);
