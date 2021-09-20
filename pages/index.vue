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
                  REVA est une expérimentation beta.gouv visant à simplifier la Validation des Acquis d'Expérience (VAE)
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
                        pt-4
                        py-8
                        px-4
                        shadow
                        sm:rounded-lg sm:px-10
                      "
                    >
                      <form
                        v-on:submit.prevent="HighFive"
                        class="space-y-6"
                        action="#"
                        method="POST"
                      >
                        <fieldset class="mt-2 sm:mt-6">
                          <div>
                            <legend class="text-base text-gray-900">
                              Êtes-vous demandeur d'emploi ?
                            </legend>
                            <p class="text-sm text-gray-500">
                              L'expérimentation REVA est pour l'instant limitée aux demandeurs d'emploi
                            </p>
                          </div>
                          <div class="mt-4 space-y-2">
                            <div class="flex items-center">
                              <input
                                id="push-everything"
                                name="push-notifications"
                                type="radio"
                                class="
                                  focus:ring-indigo-500
                                  h-4
                                  w-4
                                  text-indigo-600
                                  border-gray-300
                                "
                              />
                              <label
                                for="push-everything"
                                class="
                                  ml-3
                                  block
                                  text-sm
                                  font-medium
                                  text-gray-700
                                "
                              >
                                Oui
                              </label>
                            </div>
                            <div class="flex items-center">
                              <input
                                id="push-email"
                                name="push-notifications"
                                type="radio"
                                class="
                                  focus:ring-indigo-500
                                  h-4
                                  w-4
                                  text-indigo-600
                                  border-gray-300
                                "
                              />
                              <label
                                for="push-email"
                                class="
                                  ml-3
                                  block
                                  text-sm
                                  font-medium
                                  text-gray-700
                                "
                              >
                                Non
                              </label>
                            </div>
                            <div class="flex items-center">
                              <input
                                id="push-nothing"
                                name="push-notifications"
                                type="radio"
                                class="
                                  focus:ring-indigo-500
                                  h-4
                                  w-4
                                  text-indigo-600
                                  border-gray-300
                                "
                              />
                              <label
                                for="push-nothing"
                                class="
                                  ml-3
                                  block
                                  text-sm
                                  font-medium
                                  text-gray-700
                                "
                              >
                                Prochainement
                              </label>
                            </div>
                          </div>
                        </fieldset>

                        <!-- Choix du diplome -->
                        <div class="pt-6">
                          <!-- This example requires Tailwind CSS v2.0+ -->
                          <!--
                            Custom select controls like this require a considerable amount of JS to implement from scratch. We're planning
                            to build some low-level libraries to make this easier with popular frameworks like React, Vue, and even Alpine.js
                            in the near future, but in the mean time we recommend these reference guides when building your implementation:

                            https://www.w3.org/TR/wai-aria-practices/#Listbox
                            https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html
                          -->
                          <div>
                            <label id="listbox-label" class="sr-only">
                              Changer le diplôme
                            </label>
                            <div class="relative">
                              <div class="pr-4">
                                <legend class="text-base text-gray-900">
                                  Envisagez-vous d'obtenir l'un de ces diplômes, si oui
                                  lequel ?
                                </legend>
                                <p class="text-sm text-gray-500">
                                  L'expérimentation REVA est pour l'istant limitée à quelques diplômes
                                </p>
                                <div
                                  class="
                                    relative
                                    z-0
                                    inline-flex
                                    rounded-md
                                    mt-3
                                  "
                                >
                                  <div
                                    class="
                                      relative
                                      inline-flex
                                      items-center
                                      bg-gray-100
                                      py-2
                                      pl-3
                                      pr-4
                                      border border-transparent
                                      rounded-l-md
                                      text-gray-700
                                    "
                                  >
                                    <p class="text-left font-medium">
                                      Diplômes disponibles
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    class="
                                      relative
                                      inline-flex
                                      items-center
                                      bg-gray-100
                                      p-2
                                      rounded-l-none rounded-r-md
                                      text-sm
                                      font-medium
                                      text-white
                                      hover:bg-indigo-600
                                      focus:outline-none
                                      focus:z-10
                                      focus:ring-2
                                      focus:ring-offset-2
                                      focus:ring-offset-gray-50
                                      focus:ring-indigo-500
                                    "
                                    aria-haspopup="listbox"
                                    aria-expanded="true"
                                    aria-labelledby="listbox-label"
                                  >
                                    <span class="sr-only"
                                      >Changer le diplôme</span
                                    >

                                    <svg
                                      class="h-5 w-5 text-gray-500"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      aria-hidden="true"
                                    >
                                      <path
                                        fill-rule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clip-rule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              <!--
                                Select popover, show/hide based on select state.

                                Entering: ""
                                  From: ""
                                  To: ""
                                Leaving: "transition ease-in duration-100"
                                  From: "opacity-100"
                                  To: "opacity-0"
                              -->
                              <ul
                                class="
                                  origin-top-right
                                  absolute
                                  z-10
                                  left-0
                                  mt-2
                                  w-full
                                  sm:w-72
                                  rounded-md
                                  shadow-lg
                                  overflow-hidden
                                  bg-white
                                  divide-y divide-gray-200
                                  ring-1 ring-black ring-opacity-5
                                  focus:outline-none
                                "
                                tabindex="-1"
                                role="listbox"
                                aria-labelledby="listbox-label"
                                aria-activedescendant="listbox-option-0"
                              >
                                <!--
                                  Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

                                  Highlighted: "text-white bg-indigo-500", Not Highlighted: "text-gray-900"
                                -->
                                <li
                                  class="
                                    text-gray-900
                                    cursor-default
                                    select-none
                                    relative
                                    p-4
                                    text-sm
                                  "
                                  role="option"
                                >
                                  <div class="flex flex-col">
                                    <div class="flex justify-between">
                                      <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
                                      <p class="font-semibold">
                                        Diplôme d'État d'accompagnement éducatif
                                        et social
                                      </p>
                                      <!--
                                        Checkmark, only display for selected option.

                                        Highlighted: "text-white", Not Highlighted: "text-indigo-500"
                                      -->
                                      <span class="text-indigo-500">
                                        <!-- Heroicon name: solid/check -->
                                        <svg
                                          class="h-5 w-5"
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                          aria-hidden="true"
                                        >
                                          <path
                                            fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd"
                                          />
                                        </svg>
                                      </span>
                                    </div>
                                    <!-- Highlighted: "text-indigo-200", Not Highlighted: "text-gray-500" -->
                                    <p class="text-gray-500 mt-2">
                                      Uniquement sur la région des Pays de la
                                      Loire : départements 44, 49, 53, 72, 85
                                    </p>
                                  </div>
                                </li>

                                <li
                                  class="
                                    text-gray-900
                                    cursor-default
                                    select-none
                                    relative
                                    p-4
                                    text-sm
                                  "
                                  role="option"
                                >
                                  <div class="flex flex-col">
                                    <div class="flex justify-between">
                                      <p class="font-normal">
                                        Diplôme d'État d'accompagnement éducatif
                                        et social
                                      </p>
                                    </div>
                                    <p class="text-gray-500 mt-2">
                                      Uniquement sur la région des Pays de la
                                      Loire<br />
                                      Département 44, 49, 53, 72, 85
                                    </p>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <button
                            type="submit"
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
                          >
                            Participer
                          </button>
                        </div>
                      </form>
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
                avec Pôle emploi, REVA propose à 200 personnes ayant une expérience dans le secteur du service à la personne d’obtenir un diplôme dans ce domaine.
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
              certificateur="Diplôme délivré par le Ministère de l’Education Nationale (GIP FCIP Toulouse) et la Croix Rouge Française"
              description="L'accompagnant⋅e en gérontologie dispense des soins de nature préventive, curative, visant à promouvoir, maintenir et restaurer le bien-être, l’autonomie, l’hygiène et le confort de la personne âgée."
              link="https://www.francecompetences.fr/recherche/rncp/35558/"
              region="Occitanie - Nîmes et Toulouse, Auvergne-Rhône-Alpes - Lyon, Ile de France - Paris 12ème et Cergy"
            />
            <DiplomeCard
              label="Accompagnement, soins et services à la personne (SSP)"
              certificateur="Bac Professionnel délivré par le Ministère de l’Education Nationale"
              description="Le baccalauréat professionnel  Accompagnement, soins et services à la personne » option « en structure » permet de travailler  auprès de personnes en situation temporaire ou permanente de dépendance en structures collectives."
              link="https://www.francecompetences.fr/recherche/rncp/12301/"
              region="Auvergne-Rône-Alpes - Lyon, Ile de France - Paris 12ème et Cergy"
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
                          Au travers d'un rapide questionnaire et d'un rendez-vous avec l'organisme certificateur, vous déciderez ensemble si cette expérimentation est faite pour vous.
                        </p>
                        <p class="text-sm text-white opacity-70">
                          Vous rejoindrez alors une nouvelle méthode innovante pour obtenir un diplôme. Pour améliorer en continu cette approche, nous vous solliciterons régulièrement pour avoir vos retours et avis sur l'expérimentation.
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
                          Un organisme spécialisé vous aidera à expliquer et décrire votre expérience : vous ne serez jamais seul⋅e.
                        </p>
                        <p class="text-sm text-white opacity-70">
                          Selon votre situation, l’accompagnement se fera en individuel ou en groupe, en présence ou à distance. Et ce, sans aucun frais pour vous : l'intégralité de l'accompagnement est financé par Pôle Emploi.
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
                        <p class="font-bold">Une reconnaissance de votre expérience</p>
                        <p class="text-sm text-white opacity-70 mb-4">
                          En s’appuyant sur votre expérience professionnelle, vous serez accompagné dans la rédaction de votre dossier professionnel et dans le témoignage de vos compétences.
                        </p>
                        <p class="text-sm text-white opacity-70 mb-4">
                          ...
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
                        <p class="font-bold">Un diplôme reconnu à la clef</p>
                        <p class="text-sm text-white opacity-70">
                          Le dossier professionnel en main, et vos témoignages entendus par un jury, votre expérience professionnelle sera reconnue par un diplôme officiel.
                        </p>
                        <p class="text-sm text-white opacity-70">
                          ...
                        </p>
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
                    Beta Gouv
                  </p>
                </dt>
                <dd class="mt-2 text-base text-gray-500">
                  <a href="https://beta.gouv.fr">beta.gouv</a> est une mission de la direction interministérielle du numérique (DINUM), qui aide les administrations publiques à construire des services numériques utiles, simples, faciles à utiliser et qui répondent vraiment aux besoins des gens.<br/>
                  Elle s'incarne au sein de Startups d'État, équipes pluridisciplinaires s'appuyant sur une approche innovante de la conception de services numériques.
                </dd>
              </div>

              <div class="relative">
                <dt>
                  <p class="text-lg leading-6 font-medium text-gray-900">
                    REVA
                  </p>
                </dt>
                <dd class="mt-2 text-base text-gray-500">
                  Startup d'État visant à <b>RE</b>connaître et <b>VA</b>lider l'expérience. <br/>
                  Une équipe de 9 personnes au service de la reconnaissance de vos compétences.
                </dd>
              </div>

              <div class="relative">
                <dt>
                  <p class="text-lg leading-6 font-medium text-gray-900">
                    Implulsé par le ministère du travail
                  </p>
                </dt>
                <dd class="mt-2 text-base text-gray-500">
                  ...
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

<script>
import confetti from 'canvas-confetti'
export default {
  methods: {
    HighFive() {
      confetti({
        particleCount: 100,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
      })

      setTimeout(() => {
        // go !
      }, 900)
    },
  },
}
</script>

<style lang="scss" scoped>
.bg-custom {
  background-color: #3a21bb;
}
</style>
