"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams } from "next/navigation";

import { CompanyPreview } from "@/components/company-preview/CompanyPreview.component";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { LegalDocumentList } from "@/components/legal-document-list/LegalDocumentList";

import { graphql } from "@/graphql/generated";

import { SubscriptionRequestForm } from "./SubscriptionRequestForm";

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

        <CompanyPreview
          className="mb-8"
          company={subscriptionRequest}
          manager={subscriptionRequest}
          account={subscriptionRequest}
        />
        {subscriptionRequest.status !== "REJECTED" && (
          <LegalDocumentList
            attestationURSSAFFileUrl={
              subscriptionRequest.attestationURSSAFFile!.url
            }
            justificatifIdentiteDirigeantFileUrl={
              subscriptionRequest.justificatifIdentiteDirigeantFile!.url
            }
            lettreDeDelegationFileUrl={
              subscriptionRequest.lettreDeDelegationFile?.url
            }
            justificatifIdentiteDelegataireFileUrl={
              subscriptionRequest.justificatifIdentiteDelegataireFile?.url
            }
          />
        )}
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
