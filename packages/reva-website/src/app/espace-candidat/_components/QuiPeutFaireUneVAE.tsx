import { Card } from "@codegouvfr/react-dsfr/Card";
import Link from "next/link";

const QuiPeutFaireUneVAE = async () => (
  <section
    id="qui-peut-faire-une-vae"
    className="w-full pt-12 pb-32 lg:mb-0 mx-auto flex flex-col items-center fr-container"
  >
    <h2 className="text-[28px] leading-9 lg:text-[32px] mb-12 text-justify">
      Qui peut faire une VAE sur France VAE ?
    </h2>
    <div className="flex flex-col md:items-center md:grid grid-cols-2 gap-12">
      <p className="text-xl">
        <strong>
          Toute personne qui possède une expérience en lien direct avec la
          certification professionnelle visée.
        </strong>
        <br /> <br />
        Cette certification professionnelle doit néanmoins être enregistrée au
        répertoire national des certifications professionnelles.
        <br /> <br />
        <strong>La seule exception ?</strong> Si vous êtes{" "}
        <strong>agent public</strong>, le parcours VAE ne s’effectue pas, pour
        le moment, via la plateforme France VAE. Contactez les{" "}
        <Link
          href="/savoir-plus/articles/vae-ou-se-renseigner/"
          target="_self"
          className="fr-link !text-xl"
        >
          organismes référents
        </Link>{" "}
        pour en savoir plus.
      </p>

      <Card
        title="Qui est éligible au parcours France VAE ?"
        desc="Le nouveau parcours France VAE, plus simple et plus rapide, est accessible depuis 2023. Découvrez toutes les conditions pour réaliser ce parcours."
        endDetail="Consultez l'article"
        enlargeLink
        imageUrl="/candidate-space/qui-peut-faire-une-vae/small_Qui_est_eligible_au_parcours_France_VAE.jpg"
        imageAlt="homme en costume marchant avec une malette"
        classes={{
          imgTag: "h-[180px]",
        }}
        linkProps={{
          href: "/savoir-plus/articles/France-VAE-qui-est-eligible/",
        }}
      />
    </div>
  </section>
);

export default QuiPeutFaireUneVAE;
