"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useUpdateCertificationPage } from "./updateCertification.hook";
import { useParams } from "next/navigation";
import { ReactNode } from "react";
import { format } from "date-fns";

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
}) => (
  <div data-test="update-certification-page">
    <h1>{certification.label}</h1>
    <p className="mb-12">
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
          <h3 className="mb-2">Descriptif de la certification</h3>
          <Info title="Intitulé">{certification.label}</Info>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Info title="Niveau">{certification.degree.label}</Info>
            <Info title="Type">{certification.typeDiplome.label}</Info>
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
        </div>
      </EnhancedSectionCard>
    </div>
    <hr className="mt-8" />
    <h2>Validation par le responsable des certifications</h2>
    <p>
      Lorsque la certification est prête, vous devez l’envoyer au responsable
      des certifications pour validation. Si aucun responsable des
      certifications n’existe pour le moment et qu’aucune validation n’est
      possible, elle pourra être visible des AAP mais pas encore des candidats.
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

const Info = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <dl className={`m-2 ${className || ""}`}>
    <dt className="mb-1">{title}</dt>
    <dd className="font-medium">{children}</dd>
  </dl>
);
