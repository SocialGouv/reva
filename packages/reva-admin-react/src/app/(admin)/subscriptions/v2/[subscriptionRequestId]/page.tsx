"use client";
import { SubscriptionRequestForm } from "./SubscriptionRequestForm";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { LegalDocumentList } from "@/components/legal-document-list/LegalDocumentList";
import { graphql } from "@/graphql/generated";
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
        <div className="grid grid-cols-3 bg-neutral-100 p-6 gap-6 mb-8">
          <h2 className="col-span-3 mb-0 ">
            Informations liées au SIRET {subscriptionRequest.companySiret}
          </h2>
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
          <>
            <h3>Motif du refus</h3>
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
