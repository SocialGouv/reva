import { StatusPage } from "@/app/_components/status-page/StatusPage";
import { PICTOGRAMS } from "@/components/pictograms/Pictograms";

export default function CandidaciesEmptyState() {
  return (
    <StatusPage
      title="Mes candidatures et parcours"
      chapo="Valorisez votre expérience professionnelle en commençant une candidature dès maintenant."
      pictogram={PICTOGRAMS.searchLG}
      actionLink={{
        href: "./create",
        label: "Commencer une VAE",
      }}
    />
  );
}
