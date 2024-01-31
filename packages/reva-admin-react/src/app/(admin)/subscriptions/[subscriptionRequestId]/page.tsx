"use client";
import { SubscriptionRequestForm } from "@/app/(admin)/subscriptions/[subscriptionRequestId]/SubscriptionRequestForm";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { OrganismSummary } from "@/components/organism-summary/OrganismSummary";
import { graphql } from "@/graphql/generated";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toSelectedRegionAndDepartmentsItem } from "@/utils";

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
      subscriptionRequestOnConventionCollective {
        ccn {
          label
        }
      }
      subscriptionRequestOnDomaine {
        domaine {
          label
        }
      }
    }
  }
`);

const getRegions = graphql(`
  query getRegions {
    getRegions {
      id
      label
      departments {
        id
        label
        code
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

  const { data: getRegionsResponse } = useQuery({
    queryKey: ["getRegionsResponse"],
    queryFn: () => graphqlClient.request(getRegions),
  });

  const subscriptionRequest =
    getSubscriptionRequestResponse?.subscription_getSubscriptionRequest;

  const regions = getRegionsResponse?.getRegions || [];

  if (!subscriptionRequest) {
    return <></>;
  }

  const selectedOnSiteDepartments =
    subscriptionRequest.departmentsWithOrganismMethods
      .filter((d) => d.isOnSite)
      .map((d) => d.department);

  const selectedRemoteDepartments =
    subscriptionRequest.departmentsWithOrganismMethods
      .filter((d) => d.isRemote)
      .map((d) => d.department);

  return (
    subscriptionRequest && (
      <div className="flex flex-col flex-1 px-8 py-4">
        <Link
          href="/subscriptions/pending"
          className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
        >
          Toutes les inscriptions
        </Link>
        <OrganismSummary
          readonly
          companyName={subscriptionRequest.companyName}
          accountFirstname={subscriptionRequest.accountFirstname}
          accountLastname={subscriptionRequest.accountLastname}
          accountEmail={subscriptionRequest.accountEmail}
          accountPhoneNumber={subscriptionRequest.accountPhoneNumber}
          companyQualiopiCertificateExpiresAt={
            subscriptionRequest.qualiopiCertificateExpiresAt
          }
          companySiret={subscriptionRequest.companySiret}
          companyLegalStatus={subscriptionRequest.companyLegalStatus}
          companyAddress={subscriptionRequest.companyAddress}
          companyZipCode={subscriptionRequest.companyZipCode}
          companyCity={subscriptionRequest.companyCity}
          companyWebsite={subscriptionRequest.companyWebsite}
          companyTypology={subscriptionRequest.typology}
          onSiteDepartmentsOnRegions={regions.map(
            toSelectedRegionAndDepartmentsItem(selectedOnSiteDepartments),
          )}
          remoteDepartmentsOnRegions={regions.map(
            toSelectedRegionAndDepartmentsItem(selectedRemoteDepartments),
          )}
          ccns={subscriptionRequest?.subscriptionRequestOnConventionCollective?.map(
            (s) => s.ccn.label,
          )}
          domaines={subscriptionRequest?.subscriptionRequestOnDomaine?.map(
            (s) => s.domaine.label,
          )}
        />

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
    )
  );
};

export default SubscriptionRequestPage;
