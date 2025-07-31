"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

export const BackButton = ({ className = "" }: { className?: string }) => {
  const router = useRouter();

  return (
    <Button
      priority="secondary"
      className={className}
      onClick={() => router.back()}
    >
      Retour
    </Button>
  );
};
