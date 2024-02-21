import { push } from "@/components/analytics/matomo-tracker/matomoTracker";
import { CertificateAutocompleteDsfr } from "@/components/candidate-registration/certificate-autocomplete-dsfr/CertificateAutocompleteDsfr";
import { isUUID } from "@/utils";
import Image from "next/image";
import { useRouter } from "next/router";

const FaitesValiderVosCompetencesParUnDiplome = () => {
  const router = useRouter();
  return (
    <section
      id="faites-valider-vos-competences-par-un-diplome"
      className="w-full mx-auto flex flex-col fr-container py-14 lg:py-16"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] leading-10 lg:text-[40px] lg:leading-[48px] font-bold mb-10 lg:mb-0 max-w-screen-md">
          Avec la VAE, faites valider vos compétences par un diplôme
        </h1>
        <Image
          className="hidden lg:block"
          src="/home-page/image-home-character-blue-hoodie.png"
          width={200}
          height={200}
          alt="un personnage masculin avec un sweet bleu"
          priority
        />
      </div>

      <div className="bg-white z-10 px-6 lg:px-10 pt-8 lg:pt-10 pb-12 border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
        <h2 className="text-[28px] leading-9 lg:text-[32px] font-bold mb-6">
          Recherchez le diplôme qui vous correspond
        </h2>
        <CertificateAutocompleteDsfr
          onSubmit={({ label, value }) => {
            const certificationId = isUUID(value) ? value : null;
            push(["trackEvent", "website-diplome", "recherche", label]);
            router.push({
              pathname: "inscription-candidat",
              query: {
                certificationId,
                searchText: label,
              },
            });
          }}
          onOptionSelection={(o) =>
            router.push({
              pathname: "inscription-candidat",
              query: { certificationId: o.value },
            })
          }
        />
      </div>
    </section>
  );
};

export default FaitesValiderVosCompetencesParUnDiplome;
