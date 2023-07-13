<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false showAnotherWayIfPresent=true>
<!DOCTYPE html>
<html itemscope itemtype="http://schema.org/WebPage" lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, nofollow">

    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Accès à l’espace professionnel de France VAE" />

    <title>France VAE | Connexion à l'espace professionnel</title>

    <link href="${url.resourcesPath}/css/main.min.css" rel="stylesheet" />
    <link href="${url.resourcesPath}/css/dsfr.css" rel="stylesheet" />
    <link href="${url.resourcesPath}/css/francevae.css" rel="stylesheet" />
    <link href="${url.resourcesPath}/css/tailwind.css" rel="stylesheet" />

    <meta name="theme-color" content="#000091" />
    <!-- Défini la couleur de thème du navigateur (Safari/Android) -->
    <link rel="apple-touch-icon" href="${url.resourcesPath}/dsfr/favicon/apple-touch-icon.png" />
    <!-- 180×180 -->
    <link rel="icon" href="${url.resourcesPath}/dsfr/favicon/favicon.svg" type="image/svg+xml" />
    <link rel="shortcut icon" href="${url.resourcesPath}/dsfr/favicon/favicon.ico" type="image/x-icon" />
    <!-- 32×32 -->
    <link rel="manifest" href="${url.resourcesPath}/dsfr/favicon/manifest.webmanifest" crossorigin="use-credentials" />
    <style>
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    </style>
  </head>

  <body style="min-height: 100vh; display: flex; flex-direction: column;">
    <svg xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" width="0" height="0" style="display:none;">
      <symbol viewBox="0 0 24 24" id="ri-question-line">
        <g>
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 0 1 1-1 1.5 1.5 0 1 0-1.471-1.794l-1.962-.393A3.501 3.501 0 1 1 13 13.355z"/>
        </g>
      </symbol>
      <symbol viewBox="0 0 24 24" id="ri-external-link-line">
        <g>
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z"/>
        </g>
      </symbol>
    </svg>

    <div class="only-dsfr">
      <div class="fr-skiplinks">
        <nav class="fr-container" role="navigation" aria-label="Accès rapide">
          <ul class="fr-skiplinks__list">
            <li><a class="fr-link" href="#content" target="_self">Contenu</a></li>
            <li><a class="fr-link" href="#header-navigation" target="_self">Menu</a></li>
            <li><a class="fr-link" href="#footer" target="_self">Pied de page</a></li>
          </ul>
        </nav>
      </div>
      <header id="header-navigation" role="banner" class="fr-header">
        <div class="fr-header__body">
          <div class="fr-container">
            <div class="fr-header__body-row">
              <div class="fr-header__brand fr-enlarge-link">
                <div class="fr-header__brand-top">
                  <div class="fr-header__logo">
                    <a title="Accueil - France VAE" href="/">
                      <p class="fr-logo">République<br> Française</p>
                    </a>
                  </div>
                  <div class="fr-header__operator">
                    <a title="Accueil - France VAE" href="${properties.revaUrl}">
                      <img  style="width:9.0625rem" src="${url.resourcesPath}/img/fvae_logo.svg" alt="France VAE">
                    </a>
                  </div>
                  <div class="fr-header__navbar">
                    <button class="fr-btn--menu fr-btn" title="Menu">Menu</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>

    <main class="only-dsfr" role="main" id="content">
      <section class="" style="min-height: calc(100vh - 400px); padding-top: 1em; padding-bottom: 1em;">
        <div class="container">
          <#--  <#nested "header">  -->
          <#nested "form">
          <#nested "info">

        </div>
      </section>
    </main>
    <div class="only-dsfr" style="margin-top: auto;">
      <footer class="fr-footer" role="contentinfo" id="footer">
        <div class="fr-container">
          <div class="fr-footer__body">
            <div class="fr-footer__brand fr-enlarge-link">
              <p class="fr-logo">
                République
                <br /> Française
              </p>
              <a class="fr-footer__brand-link" href="/" title="Accueil - France VAE">
                <img class="fr-footer__logo sm:ml-12" width="225" height="138" src="${url.resourcesPath}/img/fvae_logo.svg" alt="France VAE"/>
              </a>
            </div>
            <div class="fr-footer__content">
              <p class="fr-footer__content-desc">
                France VAE est le portail officiel du service public qui vise à
                transformer la VAE avec nos partenaires.
              </p>
               <ul class="fr-footer__content-list">
                <li class="fr-footer__content-item">
                  <a class="fr-footer__content-link" target="_blank" href="https://legifrance.gouv.fr" aria-label="legifrance.gouv.fr nouvelle page">legifrance.gouv.fr</a>
                 </li>
                 <li class="fr-footer__content-item">
                  <a class="fr-footer__content-link" target="_blank" href="https://gouvernement.fr" aria-label="gouvernement.fr nouvelle page">gouvernement.fr</a>
                 </li>
                 <li class="fr-footer__content-item">
                  <a class="fr-footer__content-link" target="_blank" href="https://service-public.fr" aria-label="service-public.fr nouvelle page">service-public.fr</a>
                  </li>
                  <li class="fr-footer__content-item">
                    <a class="fr-footer__content-link" target="_blank" href="https://data.gouv.fr" aria-label="data.gouv.fr nouvelle page">data.gouv.fr</a>
                  </li>
              </ul>
            </div>
          </div>
          <div class="fr-footer__bottom">
            <ul class="fr-footer__bottom-list">
              <li class="fr-footer__bottom-item">
                <a class="fr-footer__bottom-link" href="https://vae.gouv.fr/declaration-accessibilite">Accessibilité : partiellement conforme</a>
              </li>
              <li class="fr-footer__bottom-item">
                <a class="fr-footer__bottom-link" href="https://metabase.vae.gouv.fr/public/dashboard/f27f670b-31fb-4b3d-8322-52761c4110c2">Statistiques</a>
              </li>
              <li class="fr-footer__bottom-item">
                <a class="fr-footer__bottom-link" href="https://vae.gouv.fr/mentions-l%C3%A9gale">Mentions légales</a>
              </li>
              <li class="fr-footer__bottom-item">
                <a class="fr-footer__bottom-link" href="https://vae.gouv.fr/politique-de-confidentialite">Données personnelles</a>
              </li>
              <li class="fr-footer__bottom-item">
                <a class="fr-footer__bottom-link" href="https://vae.gouv.fr/cgu">CGU</a>
              </li>
            </ul>
            <div class="fr-footer__bottom-copy">
              <p>
                Sauf mention contraire, tous les contenus de ce site sont sous <a href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" target="_blank" aria-label="licence etalab-2.0 nouvelle page">licence etalab-2.0</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </body>
</html>
</#macro>
