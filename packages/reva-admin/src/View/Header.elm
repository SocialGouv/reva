module View.Header exposing (..)

import Accessibility exposing (a, button, div, header, li, nav, span, text, ul)
import Accessibility.Aria as Aria
import Api.Token
import Data.Context exposing (Context)
import Html.Attributes exposing (alt, attribute, class, classList, href, id, style, target, title)
import Html.Attributes.Extra exposing (role)
import Route exposing (Route(..))
import View


type HeaderLink
    = Candidacies


view : Context -> Route -> Accessibility.Html msg
view context route =
    let
        activeHeaderLink =
            case route of
                Route.Candidacies _ ->
                    Just Candidacies

                Route.Candidacy _ ->
                    Just Candidacies

                _ ->
                    Nothing
    in
    header
        [ attribute "role" "banner"
        , class "fr-header"
        , id "header-navigation"
        ]
        [ div
            [ class "fr-header__body" ]
            [ div
                [ class "fr-container" ]
                [ div
                    [ class "fr-header__body-row" ]
                    [ div
                        [ class "fr-header__brand fr-enlarge-link" ]
                        [ div
                            [ class "fr-header__brand-top" ]
                            [ div
                                [ class "fr-header__logo" ]
                                [ View.logo ]
                            , div
                                [ class "fr-header__operator" ]
                                [ a
                                    [ attribute "title" "Accueil - Espace professionnel"
                                    , Route.href context.baseUrl Route.Home
                                    ]
                                    [ View.image
                                        [ style "width" "9.0625rem"
                                        , alt "France VAE"
                                        ]
                                        context.baseUrl
                                        "fvae_logo.svg"
                                    ]
                                ]
                            , div
                                [ class "fr-header__navbar" ]
                                [ button
                                    [ class "fr-btn--menu fr-btn"
                                    , attribute "data-fr-opened" "false"
                                    , attribute "aria-controls" "header-menu-modal"
                                    , attribute "aria-haspopup" "menu"
                                    , id "button-menu-modal"
                                    , title "Menu"
                                    ]
                                    [ text "Menu" ]
                                ]
                            ]
                        ]
                    , div
                        [ class "fr-header__tools" ]
                        [ div
                            [ class "fr-header__tools-links" ]
                            [ span
                                [ class "fr-btns-group" ]
                                [ a
                                    [ class "fr-btn fr-icon-logout-box-r-line"
                                    , Route.href context.baseUrl Logout
                                    ]
                                    [ text "Se déconnecter" ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        , headerMenuModal context activeHeaderLink
        ]


headerMenuModal : Context -> Maybe HeaderLink -> Accessibility.Html msg
headerMenuModal context activeHeaderLink =
    let
        itemLink label url isExternal isActive =
            li
                [ class "fr-nav__item" ]
                [ a
                    ((if isActive then
                        [ Aria.currentPage ]

                      else
                        []
                     )
                        ++ (if isExternal then
                                [ target "_self" ]

                            else
                                []
                           )
                        ++ [ class "fr-nav__link"
                           , href url
                           ]
                    )
                    [ text label ]
                ]

        navItemLink label url targetHeaderLink =
            itemLink label url False (activeHeaderLink == Just targetHeaderLink)

        adminReactUrl url =
            context.adminReactUrl ++ url

        certificateursCandidaciesLabel =
            if Api.Token.isAdmin context.token then
                "Certificateurs/Candidatures"

            else
                "Candidatures"

        navLinks =
            if Api.Token.isAdmin context.token then
                [ navItemLink "Candidatures" "/admin/candidacies" Candidacies
                , itemLink "Inscriptions" (adminReactUrl "/subscriptions/pending") True False
                , itemLink "Comptes" (adminReactUrl "/accounts/organisms") True False
                , itemLink "Certifications" (adminReactUrl "/certifications") True False
                , itemLink "Certificateurs" (adminReactUrl "/certification-authorities") True False
                , itemLink certificateursCandidaciesLabel (adminReactUrl "/candidacies/feasibilities") True False
                ]

            else if Api.Token.isAdminCertificationAuthority context.token then
                [ itemLink "Dossiers de faisabilité" (adminReactUrl "/candidacies/feasibilities") True False
                , itemLink "Gestion des comptes locaux" (adminReactUrl "/certification-authorities/local-accounts") True False
                ]

            else if Api.Token.isCertificationAuthority context.token then
                [ itemLink "Dossiers de faisabilité" (adminReactUrl "/candidacies/feasibilities") True False ]

            else if
                Api.Token.isOrganism context.token
                    && not (Api.Token.isAdmin context.token)
            then
                [ navItemLink "Candidatures" "/admin/candidacies" Candidacies
                , if Api.Token.isGestionnaireMaisonMereAAP context.token then
                    itemLink "Gestion des agences" (adminReactUrl "/agences") True False

                  else
                    text ""
                , itemLink "Paramètres du compte" (adminReactUrl "/account-settings/commercial-information") True False
                ]

            else
                []
    in
    div
        [ class "fr-header__menu fr-modal"
        , id "header-menu-modal"
        , attribute "aria-labelledby" "button-menu-modal"
        ]
        [ div
            [ class "fr-container" ]
            [ button
                [ class "fr-btn--close fr-btn"
                , attribute "aria-controls" "header-menu-modal"
                , title "Fermer"
                ]
                [ text "Fermer" ]
            , div
                [ class "fr-header__menu-links" ]
                []
            , nav
                [ id "fr-header-main-navigation"
                , class "fr-nav"
                , role "navigation"
                , Aria.label "Menu principal"
                ]
                [ ul
                    [ class "fr-nav__list"
                    , classList [ ( "h-[56px]", not <| Api.Token.isCertificationAuthority context.token ) ]
                    ]
                    navLinks
                ]
            ]
        ]
