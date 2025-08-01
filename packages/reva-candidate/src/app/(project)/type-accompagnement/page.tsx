"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { PageLayout } from "@/layouts/page.layout";

import { useTypeAccompagnementPage } from "./typeAccompagnement.hook";

type TypeAccompagnement = "AUTONOME" | "ACCOMPAGNE";

const typeAccompagnementWarningModal = createModal({
  id: "type-accompagnement-warning",
  isOpenedByDefault: false,
});

export default function ChooseTypeAccompagnementPage() {
  const { typeAccompagnement, queryStatus, updateTypeAccompagnement } =
    useTypeAccompagnementPage();

  const openTypeAccompagnementWarningModal = () =>
    typeAccompagnementWarningModal.open();

  const router = useRouter();

  const handleSubmit = async (data: {
    typeAccompagnement: TypeAccompagnement;
  }) => {
    try {
      await updateTypeAccompagnement.mutateAsync(data);
      successToast("Modifications enregistrées");
      router.push("/");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };
  return (
    <PageLayout title="Modalités de parcours">
      <Breadcrumb
        currentPageLabel="Modalité de parcours"
        className="mb-0"
        segments={[
          {
            label: "Ma candidature",
            linkProps: {
              href: "/",
            },
          },
        ]}
      />
      <h1 className="mt-8">Modalités de parcours</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Aujourd’hui, il existe 2 manières de réaliser un parcours VAE : en
        autonomie ou accompagné. Choisissez l&apos;option qui vous convient le
        mieux.
      </p>
      {queryStatus === "success" && typeAccompagnement && (
        <Form
          defaultValues={{ typeAccompagnement }}
          onSubmit={handleSubmit}
          openTypeAccompagnementWarningModal={
            openTypeAccompagnementWarningModal
          }
        />
      )}
    </PageLayout>
  );
}

const Form = ({
  defaultValues,
  onSubmit,
  openTypeAccompagnementWarningModal,
}: {
  defaultValues: { typeAccompagnement: TypeAccompagnement };
  onSubmit: (data: { typeAccompagnement: TypeAccompagnement }) => Promise<void>;
  openTypeAccompagnementWarningModal: () => void;
}) => {
  const [typeAccompagnement, setTypeAccompagnement] = useState(
    defaultValues.typeAccompagnement,
  );

  const disabled = typeAccompagnement == defaultValues.typeAccompagnement;

  return (
    <>
      <form
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ typeAccompagnement });
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
                    checked: typeAccompagnement === "ACCOMPAGNE",
                    onChange: () => setTypeAccompagnement("ACCOMPAGNE"),
                  },
                },
                {
                  label: "Je souhaite réaliser ma VAE en toute autonomie",
                  nativeInputProps: {
                    value: "AUTONOME",
                    className: "type-accompagnement-autonome-radio-button",
                    checked: typeAccompagnement === "AUTONOME",
                    onChange: () => setTypeAccompagnement("AUTONOME"),
                  },
                },
              ]}
            />
          </fieldset>
          <CallOut title="À quoi sert un accompagnateur ?">
            <p className="mt-2">
              C’est un expert de la VAE qui vous aide à chaque grande étape de
              votre parcours : rédaction du dossier de faisabilité,
              communication avec le certificateur, préparation au passage devant
              le jury, etc.
            </p>
            <p className="mt-4">
              <b>Bon à savoir : </b>Ces acompagnements peuvent être financés par
              votre{" "}
              <a
                href="https://www.moncompteformation.gouv.fr/espace-public/consulter-mes-droits-formation"
                target="_blank"
              >
                Compte Personnel de Formation
              </a>
              . À noter : si vous faites votre parcours en autonomie, les frais
              de passage devant le jury et les formations complémentaires seront
              entièrement à votre charge.
            </p>
          </CallOut>
        </div>
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <Button priority="tertiary" linkProps={{ href: "/" }}>
            Retour
          </Button>

          <Button
            className="md:ml-auto"
            data-test="submit-type-accompagnement-form-button"
            disabled={disabled}
            onClick={() => {
              openTypeAccompagnementWarningModal();
            }}
            type="button"
          >
            Enregistrer
          </Button>
        </div>
        <typeAccompagnementWarningModal.Component
          size="large"
          title="Vous vous apprêtez à changer de modalité de parcours"
          iconId="fr-icon-warning-fill"
          buttons={[
            {
              children: "Annuler",
              type: "button",
            },
            {
              children: "Confirmer",
              nativeButtonProps: {
                "data-test": "submit-type-accompagnement-modal-button",
              },
            },
          ]}
        >
          Tout changement de modalité de parcours impliquera une mise à jour de
          votre espace. Vous devrez ajouter à nouveau les informations
          essentielles au démarrage de votre parcours. Souhaitez-vous continuer
          ?
        </typeAccompagnementWarningModal.Component>
      </form>
    </>
  );
};
