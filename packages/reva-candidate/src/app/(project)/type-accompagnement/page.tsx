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
    <PageLayout title="Modalités de parcours">
      <h1 className="mt-8">Modalités de parcours</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Aujourd’hui, il exite 2 manières de réaliser un parcours VAE : en
        autonomie ou accompagné. Choisissez l&apos;option qui vous convient le
        mieux.
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
            legend="Que souhaitez-vous faire pour ce parcours ? "
            options={[
              {
                label: "Je souhaite réaliser ma VAE avec un accompagnateur",
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
        <CallOut title="À quoi sert un accompagnateur ?">
          <p className="mt-2">
            C’est un expert de la VAE qui vous aide à chaque grande étape de
            votre parcours : rédaction du dossier de faisabilité, communication
            avec le certificateur, préparation au passage devant le jury, etc.
          </p>
          <p className="mt-4">
            Ces acompagnements peuvent être financés par des dispositifs tels
            que{" "}
            <a href="https://www.moncompteformation.gouv.fr/espace-public/consulter-mes-droits-formation">
              Mon Compte Formation.
            </a>{" "}
            À noter : si vous faites votre parcours en autonomie, il est
            possible que des frais soient à votre charge (jury, formation…).
          </p>
        </CallOut>
      </div>
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <Button priority="tertiary" linkProps={{ href: "/" }}>
          Retour
        </Button>
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
