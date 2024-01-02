module Page.SiteMap exposing (view)

import Admin.Enum.CandidacyStatusFilter as CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Api.Token
import Data.Candidacy exposing (candidacyStatusFilterToReadableString)
import Data.Context exposing (Context)
import Html exposing (Html, a, div, h1, li, node, text, ul)
import Html.Attributes exposing (class, href, id, target)
import Html.Attributes.Extra exposing (role)
import Route exposing (emptyCandidacyFilters)


view :
    Context
    -> Html msg
view context =
    let
        statuses : List CandidacyStatusFilter
        statuses =
            [ CandidacyStatusFilter.ValidationHorsAbandon
            , CandidacyStatusFilter.PriseEnChargeHorsAbandon
            , CandidacyStatusFilter.ParcoursEnvoyeHorsAbandon
            , CandidacyStatusFilter.ParcoursConfirmeHorsAbandon
            , CandidacyStatusFilter.DossierFaisabiliteEnvoyeHorsAbandon
            , CandidacyStatusFilter.DossierFaisabiliteIncompletHorsAbandon
            , CandidacyStatusFilter.DossierFaisabiliteRecevableHorsAbandon
            , CandidacyStatusFilter.DemandeFinancementEnvoyeHorsAbandon
            , CandidacyStatusFilter.DemandePaiementEnvoyeeHorsAbandon
            ]

        viewLink : Route.Route -> String -> Html msg
        viewLink route label =
            li [ class "py-1" ]
                [ a
                    [ Route.href context.baseUrl <|
                        route
                    ]
                    [ text label ]
                ]

        subscriptionsLink =
            if Api.Token.isAdmin context.token then
                a
                    [ target "_parent"
                    , href "/admin2/subscriptions/pending"
                    ]
                    [ text "Inscriptions" ]

            else
                Html.text ""

        viewCandidacyLink : CandidacyStatusFilter -> Html msg
        viewCandidacyLink candidacyStatusFilter =
            viewLink (Route.Candidacies { status = candidacyStatusFilter, page = 1 }) (candidacyStatusFilterToReadableString candidacyStatusFilter)
    in
    node "main"
        [ role "main"
        , class "flex relative"
        , id "content"
        ]
        [ div [ class "h-screen flex flex-col ml fr-container mt-10" ]
            [ div [ class "mb-4 text-normal" ]
                [ h1 [ class "mb-8" ] [ text "Plan du site" ]
                , ul []
                    [ subscriptionsLink
                    , li []
                        [ viewLink (Route.Candidacies emptyCandidacyFilters) "Candidatures"
                        , ul []
                            [ viewCandidacyLink CandidacyStatusFilter.ActiveHorsAbandon
                            , ul [] <|
                                List.map
                                    viewCandidacyLink
                                    statuses
                            , viewCandidacyLink CandidacyStatusFilter.DossierFaisabiliteNonRecevableHorsAbandon
                            , viewCandidacyLink CandidacyStatusFilter.Abandon
                            , viewCandidacyLink CandidacyStatusFilter.Reorientee
                            , viewCandidacyLink CandidacyStatusFilter.ArchiveHorsAbandonHorsReorientation
                            , viewCandidacyLink CandidacyStatusFilter.ProjetHorsAbandon
                            ]
                        ]
                    , li [ class "py-1" ]
                        [ a
                            [ target "_parent"
                            , href "/mentions-legales"
                            ]
                            [ text "Mentions légales" ]
                        ]
                    , li [ class "py-1" ]
                        [ a
                            [ target "_parent"
                            , href "/confidentialite"
                            ]
                            [ text "Données personnelles" ]
                        ]
                    ]
                ]
            ]
        ]
