"use client";
import { SubscriptionRequestForm } from "./SubscriptionRequestForm";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { LegalDocumentList } from "@/components/legal-document-list/LegalDocumentList";
import { graphql } from "@/graphql/generated";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams } from "next/navigation";

const getSubscriptionRequestV2 = graphql(`
  query getSubscriptionRequestV2($subscriptionRequestId: ID!) {
    subscription_getSubscriptionRequestV2(
      subscriptionRequestId: $subscriptionRequestId
    ) {
      id
      status
      companyName
      accountFirstname
      accountLastname
      accountPhoneNumber
      accountEmail
      managerFirstname
      managerLastname
      companyWebsite
      companySiret
      companyLegalStatus
      rejectionReason
      internalComment
      attestationURSSAFFile {
        url
      }
      justificatifIdentiteDirigeantFile {
        url
      }
      lettreDeDelegationFile {
        url
      }
      justificatifIdentiteDelegataireFile {
        url
      }
      createdAt
      etablissement {
        siegeSocial
        dateFermeture
        qualiopiStatus
      }
    }
  }
`);

const SubscriptionRequestPage = () => {
  const { subscriptionRequestId }: { subscriptionRequestId: string } =
    useParams();

  const { graphqlClient } = useGraphQlClient();

  const { data: getSubscriptionRequestResponse } = useQuery({
    queryKey: ["getSubscriptionRequest", subscriptionRequestId],
    queryFn: () =>
      graphqlClient.request(getSubscriptionRequestV2, {
        subscriptionRequestId,
      }),
  });

  const subscriptionRequest =
    getSubscriptionRequestResponse?.subscription_getSubscriptionRequestV2;

  const etablissement = subscriptionRequest?.etablissement;

  if (!subscriptionRequest) {
    return <></>;
  }

  return (
    subscriptionRequest && (
      <div className="flex flex-col flex-1 px-8 py-4">
        <h1>{subscriptionRequest.companyName}</h1>
        <FormOptionalFieldsDisclaimer />
        <p>
          Inscription envoyée le{" "}
          {format(subscriptionRequest.createdAt, "dd/MM/yyyy")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 bg-neutral-100 p-6 gap-6 mb-8">
          <h2 className="md:col-span-3 mb-0 ">
            Informations liées au SIRET {subscriptionRequest.companySiret}
          </h2>
          {etablissement ? (
            <CompanyBadges
              className="md:col-span-3 mb-2 -mt-2"
              siegeSocial={etablissement.siegeSocial}
              dateFermeture={
                etablissement.dateFermeture
                  ? new Date(etablissement.dateFermeture)
                  : null
              }
              qualiopiStatus={!!etablissement.qualiopiStatus}
            />
          ) : (
            <Alert
              className="md:col-span-3 mb-2 -mt-2 mr-auto"
              severity="error"
              small
              title="Informations entreprise indisponibles"
              description=""
            />
          )}
          <Info title="Raison sociale">{subscriptionRequest.companyName}</Info>
          <Info title="Nature juridique">
            {subscriptionRequest.companyLegalStatus}
          </Info>
          <Info title="Dirigeant(e)">
            {subscriptionRequest.managerFirstname}{" "}
            {subscriptionRequest.managerLastname}
          </Info>
          <Info title="Administrateur">
            {subscriptionRequest.accountFirstname}{" "}
            {subscriptionRequest.accountLastname}
          </Info>
          <Info title="Email">{subscriptionRequest.accountEmail}</Info>
          <Info title="Téléphone">
            {subscriptionRequest.accountPhoneNumber}
          </Info>
        </div>
        <LegalDocumentList
          attestationURSSAFFileUrl={
            subscriptionRequest.attestationURSSAFFile.url
          }
          justificatifIdentiteDirigeantFileUrl={
            subscriptionRequest.justificatifIdentiteDirigeantFile.url
          }
          lettreDeDelegationFileUrl={
            subscriptionRequest.lettreDeDelegationFile?.url
          }
          justificatifIdentiteDelegataireFileUrl={
            subscriptionRequest.justificatifIdentiteDelegataireFile?.url
          }
        />
        {subscriptionRequest.status === "REJECTED" && (
          <div className="flex flex-col gap-6 mt-8">
            <div>
              <h3>Commentaire à destination de l'AAP</h3>
              <pre className="whitespace-normal">
                {subscriptionRequest.rejectionReason}
              </pre>
            </div>
            <div>
              <h3>Description interne</h3>
              <pre className="whitespace-normal">
                {subscriptionRequest.internalComment}
              </pre>
            </div>
          </div>
        )}
        {subscriptionRequest.status === "PENDING" && (
          <SubscriptionRequestForm
            className="mt-8"
            subscriptionRequestId={subscriptionRequestId}
          />
        )}
      </div>
    )
  );
};

export default SubscriptionRequestPage;

const Info = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <span>
    <dd className="font-bold">{title}</dd>
    <dt className="break-words">{children}</dt>
  </span>
);

const CompanyBadges = ({
  siegeSocial,
  dateFermeture,
  qualiopiStatus,
  className,
}: {
  siegeSocial: boolean;
  dateFermeture?: Date | null;
  qualiopiStatus: boolean;
  className?: string;
}) => (
  <div className={`flex flex-col md:flex-row gap-2 ${className || ""}`}>
    {siegeSocial ? (
      <Badge severity="success">Siège social</Badge>
    ) : (
      <Badge severity="error">Établissement secondaire</Badge>
    )}
    {!dateFermeture ? (
      <Badge severity="success">En activité</Badge>
    ) : (
      <Badge severity="error">
        Fermé le {format(dateFermeture, "dd/MM/yyyy")}
      </Badge>
    )}
    {qualiopiStatus && <Badge severity="success">Qualiopi VAE Actif</Badge>}
    {!qualiopiStatus && <Badge severity="warning">Qualiopi VAE Inactif</Badge>}
  </div>
);
