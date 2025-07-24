import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

export default function CaduciteBanner() {
  const { candidacy } = useCandidacy();
  const router = useRouter();

  const isCaduque = candidacy?.isCaduque;
  const pendingContestationCaducite =
    candidacy.candidacyContestationsCaducite?.find(
      (c) =>
        c?.certificationAuthorityContestationDecision === "DECISION_PENDING",
    );

  const hasConfirmedCaducite = candidacy.candidacyContestationsCaducite?.some(
    (contestation) =>
      contestation?.certificationAuthorityContestationDecision ===
      "CADUCITE_CONFIRMED",
  );

  switch (true) {
    case hasConfirmedCaducite:
      return (
        <Alert
          description="Après étude de votre contestation, le certificateur a décidé que votre recevabilité n'était plus valable. Cela signifie que votre parcours VAE s'arrête ici."
          severity="warning"
          title=""
          className="my-12"
        />
      );
    case !!pendingContestationCaducite:
      return (
        <Alert
          description={`Votre contestation a été faite le ${format(
            pendingContestationCaducite.contestationSentAt,
            "dd/MM/yyyy",
          )}. Elle a été envoyée à votre certificateur qui y répondra dans les
          meilleurs délais.`}
          severity="warning"
          title=""
          className="my-12"
        />
      );
    case isCaduque:
      return (
        <div className="flex flex-col gap-4 my-12">
          <Alert
            description="Parce que vous ne vous êtes pas actualisé à temps, votre recevabilité n'est plus valable. Cela signifie que votre parcours VAE s'arrête ici. Si vous souhaitez contester cette décision, cliquez sur le bouton “Contester”."
            severity="warning"
            title=""
          />
          <Button
            priority="primary"
            nativeButtonProps={{
              onClick: () => {
                router.push("/contestation");
              },
            }}
            className="self-end"
          >
            Contester
          </Button>
        </div>
      );
    default:
      return null;
  }
}
