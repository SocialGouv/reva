"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import { useGestionnaireMaisonMereAAPUserAccount } from "./gestionnaireMaisonMereAAPUserAccount.hook";

export const GestionnaireMaisonMereAAPUserAccount = ({
  maisonMereAAPId,
  userAccountId,
  backUrl,
}: {
  maisonMereAAPId: string;
  userAccountId: string;
  backUrl: string;
}) => {
  const { userAccount } = useGestionnaireMaisonMereAAPUserAccount({
    maisonMereAAPId,
    userAccountId,
  });

  const userOrganismsCount = userAccount?.organisms?.length || 0;
  return (
    <div className="w-full flex flex-col">
      <h1>
        {userAccount?.lastname} {userAccount?.firstname}
      </h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Le collaborateur ajouté recevra un mail pour finaliser son compte. Il
        pourra compléter et modifier les informations qui seront affichées aux
        candidats depuis son compte.
      </p>
      <div className="flex flex-col gap-6">
        <EnhancedSectionCard
          data-testid="informations-connexion-card"
          title="Informations de connexion"
          titleIconClass="fr-icon-info-fill"
          isEditable
          buttonOnClickHref="informations-connexion"
        />
        <EnhancedSectionCard
          data-testid="positionnement-card"
          title="Positionnement"
          titleIconClass="fr-icon-building-fill"
          CustomBadge={
            <Tag>
              {userOrganismsCount} organisme{userOrganismsCount > 1 ? "s" : ""}
            </Tag>
          }
          isEditable
          buttonOnClickHref="positionnement"
        >
          <p>
            Tant qu’un collaborateur n’est positionné sur aucun organisme
            (présentiel ou distanciel) il n’aura accès à aucune candidature de
            la structure.
          </p>
        </EnhancedSectionCard>
      </div>
      <Button
        priority="secondary"
        className="mt-12"
        linkProps={{ href: backUrl }}
      >
        Retour aux collaborateurs
      </Button>
    </div>
  );
};
