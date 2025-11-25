"use client";

import Notice from "@codegouvfr/react-dsfr/Notice";
import SkipLinks from "@codegouvfr/react-dsfr/SkipLinks";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { Footer } from "@/components/footer/Footer";

import { Header } from "./Header";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { isFeatureActive } = useAnonymousFeatureFlipping();

  const showMagicLinkNotice =
    pathname.startsWith("/login") &&
    isFeatureActive("DISABLE_CANDIDATE_MAGIC_LINK_LOGIN");

  return (
    <div className="w-full min-h-screen flex flex-col">
      <SkipLinks
        links={[
          {
            anchor: "#content",
            label: "Contenu",
          },
          {
            anchor: "#footer",
            label: "Pied de page",
          },
        ]}
      />
      <Header />
      {showMagicLinkNotice && (
        <Notice
          className="[&_p]:text-balance [&_p]:text-center"
          title={
            <>
              Vous devez désormais vous connecter à votre espace candidat avec
              un mot de passe.{" "}
              <span className="font-normal">
                Pour créer votre mot de passe, cliquez sur :{" "}
              </span>
              <Link className="font-normal" href="/forgot-password/">
                Mot de passe oublié&nbsp;?
              </Link>
            </>
          }
        />
      )}
      {children}
      <Footer />
    </div>
  );
};
