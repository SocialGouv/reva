import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

import { useCancelDropout } from "./useCancelDropout";

export const CancelDropoutButton = () => {
  const router = useRouter();
  const { candidacyId, cancelDropoutById } = useCancelDropout({
    onSuccess: () => {
      router.push(`/candidacies/${candidacyId}/summary`);
    },
  });

  return (
    <Button
      disabled={cancelDropoutById.isPending}
      onClick={() => cancelDropoutById.mutate()}
    >
      Annuler l'abandon
    </Button>
  );
};
