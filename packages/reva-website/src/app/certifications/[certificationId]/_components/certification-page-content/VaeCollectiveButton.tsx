"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";

import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

export const VaeCollectiveButton = () => {
  // useFeatureflipping is a client side hook
  // The certification page can't be a client component because it uses <UsefulResources />
  // So we extract the button to a separate component

  const { isFeatureActive } = useFeatureflipping();
  const showVaeCollectiveButton = isFeatureActive("VAE_COLLECTIVE");

  if (!showVaeCollectiveButton) {
    return null;
  }

  return (
    <Button
      priority="secondary"
      linkProps={{
        href: `/inscription-candidat/vae-collective/`,
      }}
    >
      Utiliser un code VAE collective
    </Button>
  );
};
