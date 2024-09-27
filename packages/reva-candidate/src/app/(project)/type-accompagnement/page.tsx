"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { PageLayout } from "@/layouts/page.layout";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { useTypeAccompagnementPage } from "./typeAccompagnement.hook";
import { useState } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { GraphQLError } from "graphql";
import { useRouter } from "next/navigation";

type TypeAccompagnement = "AUTONOME" | "ACCOMPAGNE";

export default function ChooseTypeAccompagnementPage() {
  const { typeAccompagnement, queryStatus, updateTypeAccompagnement } =
    useTypeAccompagnementPage();

  const router = useRouter();

  const handleSubmit = async (data: {
    typeAccompagnement: TypeAccompagnement;
  }) => {
    try {
      await updateTypeAccompagnement.mutateAsync(data);
      successToast("Modifications enregistrées");
      router.push("/");
    } catch (e) {
      graphqlErrorToast(e as GraphQLError);
    }
  };
  return (
    <PageLayout title="Choix accompagnement" displayBackToHome>
      <h1 className="mt-8">Choix accompagnement</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Vous avez la possibilité de vous faire accompagner par un professionnel
        de la VAE. Cet accompagnateur vous guidera dans les démarches
        administratives auprès du certificateur, vous guidera lors de la
        confection de votre dossier de validation et vous préparera au passage
        du jury.
      </p>
      {queryStatus === "success" && typeAccompagnement && (
        <Form defaultValues={{ typeAccompagnement }} onSubmit={handleSubmit} />
      )}
    </PageLayout>
  );
}

const Form = ({
  defaultValues,
  onSubmit,
}: {
  defaultValues: { typeAccompagnement: TypeAccompagnement };
  onSubmit?: (data: { typeAccompagnement: TypeAccompagnement }) => void;
}) => {
  const [typeAccompagnement, setTypeAccompagnement] = useState(
    defaultValues.typeAccompagnement,
  );
  return (
    <form
      className="mt-12"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({ typeAccompagnement });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <fieldset>
          <RadioButtons
            legend="Vous devez choisir d'être accompagné ou non :"
            options={[
              {
                label: "Je souhaite être accompagnée par un AAP",
                nativeInputProps: {
                  value: "ACCOMPAGNE",
                  className: "type-accompagnement-accompagne-radio-button",
                  defaultChecked: typeAccompagnement === "ACCOMPAGNE",
                  onChange: () => setTypeAccompagnement("ACCOMPAGNE"),
                },
              },
              {
                label: "Je souhaite réaliser ma VAE en toute autonomie",
                nativeInputProps: {
                  value: "AUTONOME",
                  className: "type-accompagnement-autonome-radio-button",
                  defaultChecked: typeAccompagnement === "AUTONOME",
                  onChange: () => setTypeAccompagnement("AUTONOME"),
                },
              },
            ]}
          />
        </fieldset>
        <CallOut title="Pourquoi faire le choix de l’accompagnement ?">
          Un accompagnateur vous permet d’avoir accès à toutes les infos
          nécessaires. Le financement peut alors passer par votre CPF.
        </CallOut>
      </div>
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <Button
          type="reset"
          priority="tertiary no outline"
          className="md:ml-auto"
        >
          Réinitialiser
        </Button>
        <Button data-test="submit-type-accompagnement-form-button">
          Valider
        </Button>
      </div>
    </form>
  );
};
