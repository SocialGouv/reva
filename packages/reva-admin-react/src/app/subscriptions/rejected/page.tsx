"use client";
import { SubscriptionRequestCard } from "@/app/subscriptions/components/subscription-request-card/SubscriptionRequestCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { PageTitle } from "@/components/page/page-title/PageTitle";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getRejectedSubscriptionRequests = graphql(`
  query getRejectedSubscriptionRequests($offset: Int!) {
    subscription_getSubscriptionRequests(
      status: REJECTED
      limit: 10
      offset: $offset
    ) {
      rows {
        id
        companyName
        createdAt
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

const RejectedSubscriptionRequestsPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getRejectedSubscriptionRequestsResponse } = useQuery({
    queryKey: ["getRejectedSubscriptionRequests"],
    queryFn: () =>
      graphqlClient.request(getRejectedSubscriptionRequests, { offset: 0 }),
  });

  const subscriptionRequestPage =
    getRejectedSubscriptionRequestsResponse?.subscription_getSubscriptionRequests;
  return (
    <div className="flex flex-col">
      <PageTitle>Espace pro administrateur</PageTitle>
      <p>
        En tant qu'administrateur des conseillers, vous avez la possibilité
        d'ajouter ou d'accepter de nouveaux architecte de parcours ou
        certificateur.
      </p>
      <br />
      <h4 className="text-2xl font-bold mb-6">
        Inscriptions refusées ({subscriptionRequestPage?.info.totalRows})
      </h4>
      <ul className="flex flex-col gap-5">
        {subscriptionRequestPage?.rows.map((r) => (
          <SubscriptionRequestCard
            key={r.id}
            companyName={r.companyName}
            createdAt={r.createdAt}
          />
        ))}
      </ul>
    </div>
  );
};

export default RejectedSubscriptionRequestsPage;
