import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

import { useUnarchive } from "./useUnarchive";

export const UnarchiveButton = () => {
  const router = useRouter();
  const { candidacyId, unarchiveById } = useUnarchive({
    onSuccess: () => {
      router.push(`/candidacies/${candidacyId}/summary`);
    },
  });

  return (
    <Button
      disabled={unarchiveById.isPending}
      onClick={() => unarchiveById.mutate()}
    >
      Restaurer la candidature
    </Button>
  );
};
