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
              <div class="px-4 w-full md:w-2/3 sm:px-8 xl:pr-16">
                <h1
                  class="
                    text-4xl
                    font-extrabold
                    text-gray-900
                    sm:text-5xl sm:tracking-tight
                    lg:text-6xl
                  "
                >
                  REVA est une expérimentation qui vise à transformer la VAE
                </h1>
                <p class="mt-6 text-lg text-gray-700 sm:text-2xl">
                  Elle est inscrite dans la programme des startups d'Etat
                  beta.gouv.fr. Après une 1ère expérimentation réussie,
                  présentée à la ministre du travail en mars 2022, l'équipe REVA
                  va plus loin et propose une nouvelle expérimentation à compter
                  de septembre 2022.
                </p>
                <a
                  href="https://fabnummas.notion.site/REVA-6674503f95af4e70afbc03eb2796efad"
                  class="
                    inline-flex
                    mt-4
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
                  >En savoir plus</a
                >
              </div>

              <div class="relative w-full md:w-1/3 px-8">
                <div class="flex flex-col justify-center text-left">
                  <div class="md:mx-auto md:w-full md:max-w-md">
                    <div
                      class="
                        bg-white
                        mt-6
                        pt-6
                        pb-6
                        px-6
                        shadow
                        rounded
                        md:mt-0
                      "
                    >
                      <div class="space-y-6">
                        <p>
                          Vous avez lu notre page d'information sur la prochaine
                          expérimentation REVA, vous êtes un candidat intéressé,
                          laissez nous vos coordonnées.
                        </p>
                        <div class="flex flex-row justify-center">
                          <a
                            href="/contact-signup.html"
                            class="
                              flex
                              items-center
                              justify-center
                              px-4
                              py-2
                              border border-transparent
                              text-base text-center
                              font-medium
                              rounded-md
                              text-gray-900
                              bg-gray-200
                              w-full
                              hover:bg-gray-300
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
                  l'Alimentation, le Ministère de l'Education Nationale, de la
                  Jeunesse et des Sports, le Ministère de l'Enseignement
                  Supérieur, de la Recherche et de l'Innovation, le CNEAP,
                  Brigitte Croff Conseil et Iperia.
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
