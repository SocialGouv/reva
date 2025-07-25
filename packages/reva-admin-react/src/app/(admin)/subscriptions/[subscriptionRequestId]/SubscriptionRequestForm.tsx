import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isValid } from "date-fns";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { graphqlErrorToast } from "@/components/toast/toast";

import { graphql } from "@/graphql/generated";

const validateSubscriptionRequestMutation = graphql(`
  mutation validateSubscriptionRequest($subscriptionRequestId: ID!) {
    subscription_validateSubscriptionRequest(
      subscriptionRequestId: $subscriptionRequestId
    )
  }
`);

const rejectSubscriptionRequestMutation = graphql(`
  mutation rejectSubscriptionRequest(
    $subscriptionRequestId: ID!
    $reason: String!
    $internalComment: String
  ) {
    subscription_rejectSubscriptionRequest(
      subscriptionRequestId: $subscriptionRequestId
      reason: $reason
      internalComment: $internalComment
    )
  }
`);

const schema = z.object({
  decision: z.enum(["rejected", "validated"]),
  rejectionReason: z.string().default(""),
  internalComment: z.string().default(""),
});

type FormData = z.infer<typeof schema>;

export const SubscriptionRequestForm = ({
  subscriptionRequestId,
  className,
}: {
  subscriptionRequestId: string;
  className?: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const validateSubscriptionRequest = useMutation({
    mutationFn: (params: { subscriptionRequestId: string }) =>
      graphqlClient.request(validateSubscriptionRequestMutation, params),
  });

  const rejectSubscriptionRequest = useMutation({
    mutationFn: (params: {
      subscriptionRequestId: string;
      reason: string;
      internalComment?: string;
    }) => graphqlClient.request(rejectSubscriptionRequestMutation, params),
  });

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = methods;

  const decision = watch("decision");

  const router = useRouter();

  const handleFormSubmit = handleSubmit(async (formData) => {
    try {
      if (formData.decision === "validated") {
        await validateSubscriptionRequest.mutateAsync({
          subscriptionRequestId,
        });
      } else {
        await rejectSubscriptionRequest.mutateAsync({
          subscriptionRequestId,
          reason: formData.rejectionReason,
          internalComment: formData.internalComment,
        });
      }
      router.push("/subscriptions/pending");
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  return (
    <form
      className={`flex flex-col ${className || ""}`}
      onSubmit={handleFormSubmit}
    >
      <RadioButtons
        legend="Décision prise concernant cette inscription"
        options={[
          {
            label: "Dossier valide",
            nativeInputProps: { ...register("decision"), value: "validated" },
          },
          {
            label: "Dossier invalide",
            nativeInputProps: { ...register("decision"), value: "rejected" },
          },
        ]}
      />
      {decision === "rejected" && (
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <Input
              label="Commentaire à destination de l'AAP"
              textArea
              classes={{
                label: "mb-8",
                nativeInputOrTextArea: "!min-h-[200px]",
              }}
              nativeTextAreaProps={register("rejectionReason")}
            />
            <SmallNotice>
              L'AAP recevra ce commentaire dans le mail de décision.
            </SmallNotice>
          </div>
          <div className="flex-1">
            <Input
              label="Description interne"
              hintText="(Optionnel)"
              textArea
              classes={{ nativeInputOrTextArea: "!min-h-[200px]" }}
              nativeTextAreaProps={register("internalComment")}
            />
            <SmallNotice>
              Non visible par l’AAP / Signer ce commentaire pour le suivi des
              décisions.
            </SmallNotice>
          </div>
        </div>
      )}
      <Button className="ml-auto" disabled={isSubmitting || !isValid}>
        Valider la décision
      </Button>
    </form>
  );
};
