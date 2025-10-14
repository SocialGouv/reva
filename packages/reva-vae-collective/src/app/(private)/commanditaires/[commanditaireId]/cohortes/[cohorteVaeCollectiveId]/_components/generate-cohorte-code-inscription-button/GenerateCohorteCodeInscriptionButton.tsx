"use client";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import Image from "next/image";

import { publishCohorteVAECollective } from "./actions";

const modal = createModal({
  id: "confirm-cohorte-code-generation",
  isOpenedByDefault: false,
});

export const GenerateCohorteCodeInscriptionButton = ({
  commanditaireId,
  cohorteVaeCollectiveId,
  nomCohorte,
  certificationCodeRncp,
  certificationlabel,
  aapLabel,
  disabled,
}: {
  commanditaireId: string;
  cohorteVaeCollectiveId: string;
  nomCohorte: string;
  certificationCodeRncp: string;
  certificationlabel: string;
  aapLabel: string;
  disabled?: boolean;
}) => {
  const onConfirmButtonClick = () =>
    publishCohorteVAECollective({
      commanditaireVaeCollectiveId: commanditaireId,
      cohorteVaeCollectiveId,
    });
  return (
    <>
      <modal.Component
        iconId="fr-icon-warning-fill"
        title={
          <span className="ml-2">La génération du code est irréversible.</span>
        }
        size="large"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
          },
          {
            priority: "primary",
            onClick: onConfirmButtonClick,
            children: "Générer",
          },
        ]}
      >
        <div className="flex flex-col gap-4">
          <p>
            Vous allez générer le code pour la cohorte{" "}
            <strong>{nomCohorte}</strong>. Elle concernera la certification :{" "}
            <strong>{certificationCodeRncp}</strong>{" "}
            <strong>{certificationlabel}</strong> suivie par l’Architecte
            Accompagnateur de parcours suivant : <strong>{aapLabel}</strong>.
          </p>
          <p>
            Une fois ce code créé{" "}
            <strong>
              vous ne pourrez plus modifier la certification et l’accompagnement
            </strong>{" "}
            liés à cette cohorte.
          </p>
          <p>Souhaitez-vous générer le code d’accès sur cette cohorte ?</p>
        </div>
      </modal.Component>
      <Tile
        title="Générez un lien et un code d’accès à la cohorte"
        small
        pictogram={
          <Image
            src="/vae-collective/images/pictograms/internet.svg"
            alt="Internet"
            width={40}
            height={40}
          />
        }
        enlargeLinkOrButton
        orientation="horizontal"
        desc={
          <>
            Une fois cet accès créé vous ne pourrez plus modifier la
            certification et l’accompagnement liés à cette cohorte. Vous ne
            pourrez plus la supprimer non plus.
            <br />
            Ce code et ce lien vous permettent d’inviter vos candidats à
            rejoindre la cohorte.
          </>
        }
        detail="L’activation de l’accès est irréversible."
        disabled={disabled}
        buttonProps={{
          onClick: () => modal.open(),
        }}
      />
    </>
  );
};
