module Page.SiteMap exposing (view)

import Admin.Enum.CandidacyStatusFilter as CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Api.Token
import Data.Candidacy exposing (candidacyStatusFilterToReadableString)
import Data.Context exposing (Context)
import Html exposing (Html, a, div, h1, li, node, text, ul)
import Html.Attributes exposing (class, id)
import Html.Attributes.Extra exposing (role)
import Route exposing (Filters, emptyFilters)


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
                viewLink Route.Subscriptions "Inscriptions"

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
                        [ viewLink (Route.Candidacies emptyFilters) "Candidatures"
                        , ul []
                            [ viewCandidacyLink CandidacyStatusFilter.ActiveHorsAbandon
                            , ul [] <|
                                List.map
                                    viewCandidacyLink
                                    statuses
                            , viewCandidacyLink CandidacyStatusFilter.Abandon
                            , viewCandidacyLink CandidacyStatusFilter.Reorientee
                            , viewCandidacyLink CandidacyStatusFilter.ArchiveHorsAbandonHorsReorientation
                            , viewCandidacyLink CandidacyStatusFilter.ProjetHorsAbandon
                            ]
                        ]
                    ]
                ]
            ]
        ]
