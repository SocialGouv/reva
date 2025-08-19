import Link from "next/link";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";

import { VaeCollectiveCodeForm } from "./_components/VaeCollectiveCodeForm";

export default async function VaeCollectiveCodePage({
  searchParams,
}: {
  searchParams: Promise<{ codeInscription?: string }>;
}) {
  const { codeInscription } = await searchParams;

  return (
    <MainLayout>
      <CandidateBackground>
        <div className="pt-10 pb-16">
          <div className="fr-container">
            <h1>S’inscrire à une VAE collective</h1>
            <p className="fr-text--lead mb-12">
              Veuillez renseigner le code qui vous a été transmis par votre
              porteur de projet VAE collective ou votre accompagnateur. Si vous
              rencontrez des problèmes, rapprochez vous d'eux.
            </p>
            <div className="flex flex-col lg:flex-row lg:justify-between gap-20 lg:gap-28">
              <div className="w-full flex-basis-1/2 my-10">
                <VaeCollectiveCodeForm
                  defaultValues={{
                    code: codeInscription ?? "",
                  }}
                />
              </div>
              <div className="flex flex-col flex-basis-1/2 my-auto">
                <p className="text-xl leading-relaxed">
                  <strong>
                    Vous n’avez pas de code mais vous êtes intégré à un projet
                    de VAE collective ?
                  </strong>
                  <br />
                  <span className="block text-lg">
                    Contactez votre référent afin d’obtenir ce code. Il le
                    trouvera sur son espace dédié à la gestion de ses cohortes.
                  </span>
                </p>
                <p className="text-lg">
                  En attendant, vous pouvez rechercher et consulter le diplôme
                  que vous visez.
                </p>
                <Link className="fr-link mx-auto" href="/espace-candidat/">
                  Voir les diplômes accessibles sur France VAE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CandidateBackground>
    </MainLayout>
  );
}
