"use client";
import { SubscriptionRequestForm } from "@/app/subscriptions/[subscriptionRequestId]/SubscriptionRequestForm";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { SubscriptionOrganismTypology } from "@/graphql/generated/graphql";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

const getSubscriptionRequest = graphql(`
  query getSubscriptionRequest($subscriptionRequestId: ID!) {
    subscription_getSubscriptionRequest(
      subscriptionRequestId: $subscriptionRequestId
    ) {
      id
      status
      companyName
      accountFirstname
      accountLastname
      accountPhoneNumber
      qualiopiCertificateExpiresAt
      accountEmail
      companyWebsite
      companySiret
      companyLegalStatus
      companyAddress
      companyZipCode
      companyCity
      typology
      rejectionReason
      isCompanyNameUnique
      departmentsWithOrganismMethods {
        department {
          id
          code
          label
        }
        isOnSite
        isRemote
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
      graphqlClient.request(getSubscriptionRequest, {
        subscriptionRequestId,
      }),
  });

  const subscriptionRequest =
    getSubscriptionRequestResponse?.subscription_getSubscriptionRequest;

  const getTypologyLabel = (typology: SubscriptionOrganismTypology) => {
    switch (typology) {
      case "expertBranche":
        return "Expert branche";
      case "expertFiliere":
        return "Expert filière";
      case "generaliste":
        return "Généraliste";
    }
  };
  return (
    subscriptionRequest && (
      <div className="flex flex-col flex-1">
        <Link
          href="/subscriptions/pending"
          className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
        >
          Toutes les inscriptions
        </Link>
        <div className="flex flex-col mt-10">
          <h1 className="text-4xl font-bold">
            {subscriptionRequest.companyName}
          </h1>
          <h2 className="text-xl font-bold my-4">Informations générales</h2>
          <div className="grid grid-cols-2">
            <Info title="Nom de l'architecte de parcours">
              {subscriptionRequest.accountFirstname}{" "}
              {subscriptionRequest.accountLastname}
            </Info>
            <Info title="Adresse email de l'architecte de parcours">
              {subscriptionRequest.accountEmail}
            </Info>
            <Info title="Téléphone de l'architecte de parcours">
              {subscriptionRequest.accountPhoneNumber}
            </Info>
            <Info title="Site internet de la structure">
              {subscriptionRequest.companyWebsite || "Non spécifié"}
            </Info>
            <Info title="Date d'expiration de la certification Qualiopi VAE">
              {format(
                subscriptionRequest.qualiopiCertificateExpiresAt,
                "dd/MM/yyyy",
              )}
            </Info>
          </div>
          <br />
          <h2 className="text-xl font-bold my-4">
            Informations juridiques de la structure
          </h2>
          <div className="grid grid-cols-2">
            <Info title="SIRET de la structure">
              {subscriptionRequest.companySiret}
            </Info>
            <Info
              title="Forme juridique
"
            >
              {subscriptionRequest.companyLegalStatus}
            </Info>
            <Info
              title="Adresse de la structure
"
            >
              {subscriptionRequest.companyAddress}{" "}
              {subscriptionRequest.companyZipCode}{" "}
              {subscriptionRequest.companyCity}
            </Info>
          </div>
          <br />
          <h2 className="text-xl font-bold my-4">
            Typologie et zone d'intervention
          </h2>
          <Info title="Typologie">
            {getTypologyLabel(subscriptionRequest.typology)}
          </Info>
          <div className="grid grid-cols-2">
            <Info title="Zone d'intervention en présentiel">
              <ul className="ml-4">
                {subscriptionRequest.departmentsWithOrganismMethods
                  .filter((d) => d.isOnSite)
                  .map((d) => (
                    <li key={d.department.id} className="list-disc">
                      {d.department.label} ({d.department.code})
                    </li>
                  ))}
              </ul>
            </Info>
            <Info title="Zone d'intervention en distanciel">
              <ul className="ml-4">
                {subscriptionRequest.departmentsWithOrganismMethods
                  .filter((d) => d.isRemote)
                  .map((d) => (
                    <li key={d.department.id} className="list-disc">
                      {d.department.label} ({d.department.code})
                    </li>
                  ))}
              </ul>
            </Info>
          </div>
          <hr className="mt-8 mb-4" />
          {!subscriptionRequest.isCompanyNameUnique && (
            <Alert
              className="mb-6"
              title=""
              severity="warning"
              description="Une structure portant la même raison sociale existe déjà."
            />
          )}
          {subscriptionRequest.status === "REJECTED" && (
            <>
              <h2 className="text-xl font-bold mb-4">Motif du refus</h2>
              <pre className="whitespace-normal">
                {subscriptionRequest.rejectionReason}
              </pre>
            </>
          )}
          {subscriptionRequest.status === "PENDING" && (
            <SubscriptionRequestForm
              subscriptionRequestId={subscriptionRequestId}
            />
          )}
        </div>
      </div>
    )
  );
};

const Info = ({ title, children }: { title: string; children: ReactNode }) => (
  <dl className="m-2">
    <dt className="font-normal text-sm text-gray-600 mb-1">{title}</dt>
    <dd>{children}</dd>
  </dl>
);

export default SubscriptionRequestPage;
