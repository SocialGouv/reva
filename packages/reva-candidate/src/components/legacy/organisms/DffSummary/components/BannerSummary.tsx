import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export function BannerSummary({
  sentToCertificationAuthorityAt,
  isCaduque,
}: {
  sentToCertificationAuthorityAt?: number | null;
  isCaduque: boolean;
}) {
  const router = useRouter();
  const { isFeatureActive } = useFeatureFlipping();

  const isCandidacyActualisationFeatureActive = isFeatureActive(
    "candidacy_actualisation",
  );

  if (isCaduque && isCandidacyActualisationFeatureActive) {
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
  }

  if (sentToCertificationAuthorityAt) {
    return (
      <Alert
        description={`Dossier envoyé au certificateur le ${format(
          sentToCertificationAuthorityAt,
          "dd/MM/yyyy",
        )}`}
        severity="success"
        title=""
        className="mb-12"
      />
    );
  }

  return (
    <p className="text-xl mb-12">
      Vous avez en partie rempli ce dossier avec votre accompagnateur. Vérifiez
      les informations puis validez votre dossier en envoyant une attestation
      sur l'honneur à votre accompagnateur. Il se chargera ensuite de le
      transmettre au certificateur qui se prononcera sur la recevabilité.
    </p>
  );
}
