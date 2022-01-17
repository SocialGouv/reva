<template>
  <div class="antialiased">
    <Header />

    <!-- HERO -->
    <section class="bg-gray-50">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="relative">
          <main class="lg:relative">
            <div
              class="
                md:flex
                mx-auto
                w-full
                pt-16
                pb-20
                text-center
                lg:py-12
                md:text-left
              "
            >
              <div class="px-4 w-full sm:w-1/2 sm:px-8 xl:pr-16">
                <h1
                  class="
                    text-4xl
                    font-extrabold
                    text-gray-900
                    sm:text-5xl sm:tracking-tight
                    lg:text-6xl
                  "
                >
                  Votre diplôme en 4 mois, financé, accompagné et personnalisé
                </h1>
                <p class="mt-6 text-lg text-gray-700 sm:text-2xl">
                  REVA est une expérimentation beta.gouv visant à simplifier la
                  Validation des Acquis de l'Expérience (VAE)
                </p>
              </div>

              <div class="relative w-full sm:w-1/2 px-8">
                <div
                  class="flex flex-col justify-center text-left sm:px-6 lg:px-8"
                >
                  <div class="sm:mx-auto sm:w-full sm:max-w-md">
                    <div
                      class="
                        bg-white
                        mt-4
                        pt-4
                        py-8
                        px-4
                        shadow
                        sm:rounded-lg sm:px-10 sm:mt-0
                      "
                    >
                      <div class="space-y-6">
                        <p>
                          L'expérimentation REVA se termine bientôt, les
                          candidatures sont closes.
                        </p>
                        <p>
                          Vous êtes un(e) professionnel(le) de la VAE, nos
                          expérimentations vous intéressent, laissez nous vos
                          coordonnées.
                        </p>
                        <div class="flex flex-row justify-center">
                          <a
                            href="/contact-signup.html"
                            class="
                              inline-flex
                              items-center
                              px-4
                              py-2
                              border border-transparent
                              text-base
                              font-medium
                              rounded-md
                              shadow-sm
                              text-white
                              bg-indigo-600
                              hover:bg-indigo-700
                              focus:outline-none
                              focus:ring-2
                              focus:ring-offset-2
                              focus:ring-indigo-500
                            "
                            >Je suis intéressé(e)</a
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>

    <!-- Les diplômes -->
    <section class="bg-gray-200">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="py-12">
          <div
            class="
              relative
              max-w-xl
              mx-auto
              py-8
              pb-20
              px-4
              sm:px-6
              lg:px-8 lg:max-w-7xl
            "
          >
            <div class="relative">
              <h2
                class="
                  text-center text-3xl
                  leading-8
                  font-extrabold
                  tracking-tight
                  text-gray-900
                  sm:text-5xl
                "
              >
                Pendant 4 mois
              </h2>
              <p
                class="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500"
              >
                Sous l'impulsion du Ministère du Travail et en collaboration
                avec Pôle emploi, REVA propose à 200 personnes ayant une
                expérience dans le secteur du service à la personne d’obtenir un
                diplôme dans ce domaine.
              </p>
            </div>
          </div>

          <div class="diplomes grid grid-cols-1 sm:grid-cols-3 gap-8">
            <DiplomeCard
              label="Assistant⋅e de Vie aux Familles (ADVF)"
              certificateur="Diplôme (titre professionnel) délivré par le Ministère du Travail"
              description="Les personnes assistantes  de  vie  aux  familles contribuent au bien être des personnes au sein de leur foyer en respectant leur dignité, leur intégrité, leur vie privée et leur sécurité."
              link="https://www.francecompetences.fr/recherche/rncp/35506/"
              region="Auvergne-Rhône-Alpes - Montluçon et Lyon, Ile de France - Paris 12ème et Cergy"
            />
            <DiplomeCard
              label="Agent⋅e de Service Médico-social (ASMS)"
              certificateur="Diplôme (titre professionnel) délivré par le Ministère du Travail"
              description="L’agent⋅e de service médico-social réalise le nettoyage et le bionettoyage des locaux de l'établissement et contribue aux prestations du service hôtelier tout en prenant en compte la disposition psychique et l'état physique du résident au moment où il intervient auprès de lui ou dans son espace."
              link="https://www.francecompetences.fr/recherche/rncp/35028/"
              region="Auvergne-Rhône-Alpes - Montluçon et Lyon, Ile de France - Paris 12ème et Cergy"
            />
            <DiplomeCard
              label="Accompagnant Éducatif et Social (DEAES)"
              certificateur="Diplôme d’État délivré par le Ministère des Solidarités et de la Santé"
              description="L’accompagnant éducatif et social de proximité réalise une intervention sociale au quotidien visant à compenser les conséquences d'un handicap, quelles qu’en soient l’origine ou la nature."
              link="https://www.francecompetences.fr/recherche/rncp/25467/"
              region="Hauts-de-france Lille, Auvergne-Rhône-Alpes - Montluçon et Lyon, Ile de France - Paris 12ème et Cergy"
            />
            <DiplomeCard
              label="Conducteur Accompagnateur de Personne à Mobilité Réduite (CaPMR)"
              certificateur="Diplôme (certification) délivré par le Conseil National de l’Enseignement Agricole Privé (CNEAP) et Brigitte Croff Conseil et Associés (BCCA) et reconnu par la branche professionnelle"
              description="Le conducteur accompagnateur ou la conductrice accompagnatrice accompagne les personnes à mobilité réduite du fait d'un handicap physique, mental, sensoriel ou intellectuel ou d'une forme de dépendance quelle qu'elle soit qui rend impossibles les déplacements sans accompagnement."
              link="https://www.francecompetences.fr/recherche/rncp/17163/"
              region="Région Grand-Est - Mulhouse, Auvergne-Rhône-Alpes - Lyon, Ile de France - Paris 12ème et Cergy"
            />
            <DiplomeCard
              label="Accompagnant⋅e en gérontologie"
              certificateur="Diplôme délivré par le GIP FCIP de Toulouse et la Croix Rouge Française"
              description="L'accompagnant⋅e en gérontologie dispense des soins de nature préventive, curative, visant à promouvoir, maintenir et restaurer le bien-être, l’autonomie, l’hygiène et le confort de la personne âgée."
              link="https://www.francecompetences.fr/recherche/rncp/35558/"
              region="Occitanie - Montpellier et Toulouse, Auvergne-Rhône-Alpes - Lyon, Ile de France - Paris 12ème et Cergy"
            />
            <DiplomeCard
              label="Employé⋅e Familial"
              certificateur="Diplôme délivré par IPERIA et reconnu par la branche professionnelle"
              description="L’employé⋅e familial intervient au domicile des particuliers (en leur présence ou non) principalement pour l’entretien du cadre de vie, du linge et la préparation des repas."
              link="https://www.francecompetences.fr/recherche/rncp/34692/"
              region="Provence-Alpes-Côte d’Azur - Nice et Toulon, Auvergne-Rhône-Alpes - Lyon, Ile de France - Paris 12ème et Cergy"
            />
            <DiplomeCard
              label="Assistant⋅e de vie dépendance"
              certificateur="Diplôme délivré par IPERIA et reconnu par la branche professionnelle"
              description="La mission de l’assistant⋅e de vie dépendance est d’accompagner des personnes dont l’autonomie est altérée dans la réalisation de leurs activités, pouvant aller des tâches courantes aux actes essentiels de la vie quotidienne."
              link="https://www.francecompetences.fr/recherche/rncp/34690/"
              region="Provence-Alpes-Côte d’Azur - Nice et Toulon, Auvergne-Rhône-Alpes - Lyon, Ile de France - Paris 12ème et Cergy"
            />
          </div>

          <!-- <div class="text-center mx-auto py-6 mt-12">
            <nuxt-link to="inscription" class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-custom hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Participer
            </nuxt-link>
          </div> -->
        </div>
      </div>
    </section>

    <!-- Ce qui attends les candidats -->
    <section class="bg-custom text-white">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="py-12">
          <div class="px-6 mt-4 max-w-3xl mx-auto text-center">
            <h2
              class="
                text-4xl
                font-extrabold
                text-white
                sm:text-5xl sm:tracking-tight
              "
            >
              Qu'est-ce qui vous attend ?
            </h2>
          </div>
          <div class="flow-root px-6 mt-20 max-w-sm mx-auto">
            <ul role="list" class="-mb-8">
              <li>
                <div class="relative pb-8">
                  <span
                    class="
                      absolute
                      top-4
                      left-4
                      -ml-px
                      h-full
                      w-0.5
                      bg-gray-200
                    "
                    aria-hidden="true"
                  ></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        class="
                          h-8
                          w-8
                          rounded-full
                          bg-white
                          flex
                          items-center
                          justify-center
                          ring-8 ring-white
                        "
                      >
                        <!-- Heroicon name: solid/user -->
                        <svg
                          class="h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <div
                      class="
                        min-w-0
                        flex-1
                        pt-1.5
                        flex
                        justify-between
                        space-x-4
                        pl-4
                      "
                    >
                      <div>
                        <p class="font-bold">Une candidature simple</p>
                        <p class="text-sm text-white opacity-70 mb-4">
                          Au travers d'un rapide questionnaire et d'un
                          rendez-vous avec l'organisme certificateur, vous
                          déciderez ensemble si cette expérimentation est faite
                          pour vous.
                        </p>
                        <p class="text-sm text-white opacity-70">
                          Vous rejoindrez alors une nouvelle méthode innovante
                          pour obtenir un diplôme. Pour améliorer en continu
                          cette approche, nous vous solliciterons régulièrement
                          pour avoir vos retours et avis sur l'expérimentation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div class="relative pb-8">
                  <span
                    class="
                      absolute
                      top-4
                      left-4
                      -ml-px
                      h-full
                      w-0.5
                      bg-gray-200
                    "
                    aria-hidden="true"
                  ></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        class="
                          h-8
                          w-8
                          rounded-full
                          bg-white
                          flex
                          items-center
                          justify-center
                          ring-8 ring-white
                        "
                      >
                        <!-- Heroicon name: solid/user -->
                        <svg
                          class="h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <div
                      class="
                        min-w-0
                        flex-1
                        pt-1.5
                        flex
                        justify-between
                        space-x-4
                        pl-4
                      "
                    >
                      <div>
                        <p class="font-bold">Un accompagnement à 100%</p>
                        <p class="text-sm text-white opacity-70 mb-4">
                          Un organisme spécialisé vous aidera à expliquer et
                          décrire votre expérience : vous ne serez jamais
                          seul⋅e.
                        </p>
                        <p class="text-sm text-white opacity-70">
                          Selon votre situation, l’accompagnement se fera en
                          individuel ou en groupe, en présence ou à distance. Et
                          ce, sans aucun frais pour vous : l'intégralité de
                          l'accompagnement est financé par Pôle Emploi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div class="relative pb-8">
                  <span
                    class="
                      absolute
                      top-4
                      left-4
                      -ml-px
                      h-full
                      w-0.5
                      bg-gray-200
                    "
                    aria-hidden="true"
                  ></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        class="
                          h-8
                          w-8
                          rounded-full
                          bg-white
                          flex
                          items-center
                          justify-center
                          ring-8 ring-white
                        "
                      >
                        <!-- Heroicon name: solid/user -->
                        <svg
                          class="h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <div
                      class="
                        min-w-0
                        flex-1
                        pt-1.5
                        flex
                        justify-between
                        space-x-4
                        pl-4
                      "
                    >
                      <div>
                        <p class="font-bold">
                          Une reconnaissance de votre expérience
                        </p>
                        <p class="text-sm text-white opacity-70 mb-4">
                          En s’appuyant sur votre expérience professionnelle,
                          vous serez accompagné dans la rédaction de votre
                          dossier professionnel et dans le témoignage de vos
                          compétences.
                        </p>
                        <p class="text-sm text-white opacity-70 mb-4">...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div class="relative pb-8">
                  <span
                    class="
                      absolute
                      top-4
                      left-4
                      -ml-px
                      h-full
                      w-0.5
                      bg-gray-200
                    "
                    aria-hidden="true"
                  ></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        class="
                          h-8
                          w-8
                          rounded-full
                          bg-white
                          flex
                          items-center
                          justify-center
                          ring-8 ring-white
                        "
                      >
                        <!-- Heroicon name: solid/user -->
                        <svg
                          class="h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <div
                      class="
                        min-w-0
                        flex-1
                        pt-1.5
                        flex
                        justify-between
                        space-x-4
                        pl-4
                      "
                    >
                      <div>
                        <p class="font-bold">Un diplôme reconnu à la clef</p>
                        <p class="text-sm text-white opacity-70">
                          Le dossier professionnel en main, et vos témoignages
                          entendus par un jury, votre expérience professionnelle
                          sera reconnue par un diplôme officiel.
                        </p>
                        <p class="text-sm text-white opacity-70">...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Qui sommes nous -->
    <section class="bg-white">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="py-12">
          <div class="px-6 mt-4 max-w-3xl mx-auto text-center">
            <h3 class="text-4xl font-extrabold sm:text-5xl sm:tracking-tight">
              Qui sommes-nous ?
            </h3>
          </div>
          <div class="mt-10">
            <dl
              class="
                space-y-10
                md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10
              "
            >
              <div class="relative">
                <dt>
                  <p class="text-lg leading-6 font-medium text-gray-900">
                    beta.gouv.fr
                  </p>
                </dt>
                <dd class="mt-2 text-base text-gray-500">
                  <a href="https://beta.gouv.fr">beta.gouv</a> est une mission
                  de la direction interministérielle du numérique (DINUM), qui
                  aide les administrations publiques à construire des services
                  numériques utiles, simples, faciles à utiliser et qui
                  répondent vraiment aux besoins des gens.<br />
                  Elle s'incarne au sein de Startups d'État, équipes
                  pluridisciplinaires s'appuyant sur une approche innovante de
                  la conception de services numériques.
                </dd>
              </div>

              <div class="relative">
                <dt>
                  <p class="text-lg leading-6 font-medium text-gray-900">
                    REVA
                  </p>
                </dt>
                <dd class="mt-2 text-base text-gray-500">
                  Plateforme numérique en construction qui vise à
                  <b>RE</b>connaître et <b>VA</b>lider l'expérience. <br />
                  Nous sommes une équipe de 9 personnes, au sein d'une Startup
                  d'État incubée à la
                  <a href="https://www.fabrique.social.gouv.fr/" target="_blank"
                    >Fabrique Numérique des Ministères Sociaux</a
                  >
                  et nous œuvrons au service de la reconnaissance de vos
                  compétences.
                </dd>
              </div>

              <div class="relative">
                <dt>
                  <p class="text-lg leading-6 font-medium text-gray-900">
                    Ministères & partenaires
                  </p>
                </dt>
                <dd class="mt-2 text-base text-gray-500">
                  Ce projet est initié par le Ministère du Travail, de l'Emploi
                  et de l'Insertion, ainsi que par le Haut Commissariat aux
                  Compétences. Il associe également le Ministère des Solidarités
                  et de la Santé, le Ministère de l'Agriculture et de
                  l'Alimentation, de la branche professionnelle du Particulier
                  Employeur et de la Croix Rouge.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>


<style lang="scss" scoped>
.bg-custom {
  background-color: #3a21bb;
}
</style>
