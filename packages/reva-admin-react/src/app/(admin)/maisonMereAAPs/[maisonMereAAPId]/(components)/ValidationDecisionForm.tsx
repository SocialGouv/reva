import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { SyntheticEvent, useState } from "react";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlErrorToast } from "@/components/toast/toast";
import { MaisonMereAapLegalInformationDocumentsDecisionEnum, UpdateMaisonMereAapLegalValidationDecisionInput } from "@/graphql/generated/graphql";
import { graphql } from "@/graphql/generated";

const updateMaisonMereAAPLegalValidationDecisionMutation = graphql(`
  mutation updateLegalInformationValidationDecision(
    $data: UpdateMaisonMereAAPLegalValidationDecisionInput!
  ) {
    organism_updateLegalInformationValidationDecision(data: $data) {
      id
    }
  }
`);

const useUpdateMaisonMereAAPLegalValidationDecision = (
  maisonMereAAPId: string,
) => {
  const { graphqlClient } = useGraphQlClient();
  const {
    mutateAsync: updateMaisonMereAAPLegalValidationDecisionMutate,
    isPending: updateMaisonMereAAPLegalValidationDecisionIsPending,
  } = useMutation({
    mutationKey: ["updateMaisonMereAAPLegalValidationStatus", maisonMereAAPId],
    mutationFn: ({ data }: { data: UpdateMaisonMereAapLegalValidationDecisionInput }) =>
      graphqlClient.request(updateMaisonMereAAPLegalValidationDecisionMutation, {
        data,
      }),
  });

  return {
    updateMaisonMereAAPLegalValidationDecisionMutate,
    updateMaisonMereAAPLegalValidationDecisionIsPending,
  };
};

export default function ValidationDecisionForm({
  maisonMereAAPId,
  aapUpdatedDocumentsAt,
}: {
  maisonMereAAPId: string;
  aapUpdatedDocumentsAt: number;
}) {
  const [aapCommentState, setAapCommentState] = useState<
    "default" | "success" | "error"
  >("default");
  const [aapCommentStateMessage, setAapCommentStateMessage] =
    useState<string>("");

  const {
    updateMaisonMereAAPLegalValidationDecisionMutate,
    updateMaisonMereAAPLegalValidationDecisionIsPending,
  } = useUpdateMaisonMereAAPLegalValidationDecision(maisonMereAAPId);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    console.log("maisonMereAAPId", maisonMereAAPId);
    console.log(formData);
    if (
      formData.get("decision") === "DEMANDE_DE_PRECISION" &&
      !formData.get("aapComment")
    ) {
      setAapCommentState("error");
      setAapCommentStateMessage(
        "Veuillez renseigner un commentaire lorsque vous demandez des précisions",
      );
      return;
    }
    try {
      await updateMaisonMereAAPLegalValidationDecisionMutate({
        data: {
          maisonMereAAPId: maisonMereAAPId,
          decision: formData.get("decision") as MaisonMereAapLegalInformationDocumentsDecisionEnum,
          aapComment: formData.get("aapComment") as string,
          internalComment: formData.get("internalComment") as string,
          aapUpdatedDocumentsAt: aapUpdatedDocumentsAt
        },
      });
      setAapCommentState("success");
      setAapCommentStateMessage("Succès");
    } catch(e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <fieldset className="grid">
            <RadioButtons
              small
              legend="Décision prise sur cette inscription"
              name="decision"
              options={[
                {
                  label: "Accepté",
                  nativeInputProps: {
                    value: "VALIDE",
                  },
                },
                {
                  label: "Demande de précision",
                  nativeInputProps: {
                    defaultChecked: true,
                    value: "DEMANDE_DE_PRECISION",
                  },
                },
              ]}
            />
            <Input
              label="Commentaire à destination de l'AAP : "
              textArea
              state={aapCommentState}
              stateRelatedMessage={aapCommentStateMessage}
              nativeTextAreaProps={{
                name: "aapComment",
                rows: 4,
              }}
            />
            <SmallNotice>
              L'AAP recevra ce commentaire dans le mail de décision
            </SmallNotice>
          </fieldset>
          <fieldset className="grid border p-4">
            <Input
              label="Description interne"
              hintText="(optionnel)"
              textArea
              nativeTextAreaProps={{
                name: "internalComment",
                rows: 8,
              }}
            />
            <SmallNotice>
              Non visible par l’AAP / Signer ce commentaire pour le suivi des
              décisions
            </SmallNotice>
          </fieldset>
        </div>
        <div className="w-full mt-8 flex flex-row justify-between">
          <Button
            priority="secondary"
            linkProps={{ href: "/subscriptions/check-legal-information/" }}
          >
            Retour
          </Button>
          <Button type="submit" disabled={updateMaisonMereAAPLegalValidationDecisionIsPending}>
            Envoyer
          </Button>
        </div>
      </form>
    </div>
  );
}
