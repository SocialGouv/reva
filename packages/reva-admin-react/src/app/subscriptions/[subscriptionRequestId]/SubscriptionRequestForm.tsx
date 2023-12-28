import { z } from "zod";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { graphql } from "@/graphql/generated";
import { isValid } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { errorToast } from "@/components/toast/toast";
import { useRouter } from "next/navigation";

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
  ) {
    subscription_rejectSubscriptionRequest(
      subscriptionRequestId: $subscriptionRequestId
      reason: $reason
    )
  }
`);

export const schema = z.object({
  decision: z.enum(["rejected", "validated"]),
  rejectionReason: z.string().default(""),
});

export type FormData = z.infer<typeof schema>;

export const SubscriptionRequestForm = ({
  subscriptionRequestId,
}: {
  subscriptionRequestId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const validateSubscriptionRequest = useMutation({
    mutationFn: (params: { subscriptionRequestId: string }) =>
      graphqlClient.request(validateSubscriptionRequestMutation, params),
  });

  const rejectSubscriptionRequest = useMutation({
    mutationFn: (params: { subscriptionRequestId: string; reason: string }) =>
      graphqlClient.request(rejectSubscriptionRequestMutation, params),
  });

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
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
        });
      }
      router.push("/subscriptions/pending");
    } catch (e) {
      console.log(e);
      errorToast("Une erreur est survenue");
    }
  });

  return (
    <>
      <p className="text-gray-600">
        Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
        obligatoires.
      </p>
      <br />
      <form className="flex flex-col" onSubmit={handleFormSubmit}>
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
          <Input
            label="PRÉCISEZ LES MOTIFS DE VOTRE DÉCISION (OPTIONNEL)"
            hintText="Texte de description libre"
            textArea
            classes={{ nativeInputOrTextArea: "!min-h-[200px]" }}
            className="max-w-md"
            nativeTextAreaProps={register("rejectionReason")}
          />
        )}
        <Button className="ml-auto" disabled={isSubmitting || !isValid}>
          Valider la décision
        </Button>
      </form>
    </>
  );
};
