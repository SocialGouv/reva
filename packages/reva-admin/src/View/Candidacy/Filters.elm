module View.Candidacy.Filters exposing (Filters, view)

import Admin.Enum.CandidacyStatusFilter as CandidacyStatusFilter exposing (CandidacyStatusFilter)
import Api.Token
import Data.Candidacy exposing (CandidacyCountByStatus, candidacyStatusFilterToReadableString)
import Data.Context exposing (Context)
import Html exposing (Html, a, label, li, text, ul)
import Html.Attributes exposing (attribute, class, classList)
import Route


type alias Filters =
    { status : CandidacyStatusFilter
    , page : Int
    }


view :
    CandidacyCountByStatus
    -> Filters
    -> Context
    -> List (Html msg)
view candidacyCountByStatus filters context =
    let
        count : CandidacyStatusFilter -> Int
        count status =
            case status of
                CandidacyStatusFilter.ActiveHorsAbandon ->
                    candidacyCountByStatus.activeHorsAbandon

                CandidacyStatusFilter.Abandon ->
                    candidacyCountByStatus.abandon

                CandidacyStatusFilter.Reorientee ->
                    candidacyCountByStatus.reorientee

                CandidacyStatusFilter.ArchiveHorsAbandonHorsReorientation ->
                    candidacyCountByStatus.archiveHorsAbandonHorsReorientation

                CandidacyStatusFilter.DemandePaiementEnvoyeeHorsAbandon ->
                    candidacyCountByStatus.demandePaiementEnvoyeHorsAbandon

                CandidacyStatusFilter.DemandeFinancementEnvoyeHorsAbandon ->
                    candidacyCountByStatus.demandeFinancementEnvoyeHorsAbandon

                CandidacyStatusFilter.ParcoursConfirmeHorsAbandon ->
                    candidacyCountByStatus.parcourConfirmeHorsAbandon

                CandidacyStatusFilter.DossierFaisabiliteEnvoyeHorsAbandon ->
                    candidacyCountByStatus.dossierFaisabiliteEnvoyeHorsAbandon

                CandidacyStatusFilter.DossierFaisabiliteIncompletHorsAbandon ->
                    candidacyCountByStatus.dossierFaisabiliteIncompletHorsAbandon

                CandidacyStatusFilter.DossierFaisabiliteRecevableHorsAbandon ->
                    candidacyCountByStatus.dossierFaisabiliteRecevableHorsAbandon

                CandidacyStatusFilter.DossierFaisabiliteNonRecevableHorsAbandon ->
                    candidacyCountByStatus.dossierFaisabiliteNonRecevableHorsAbandon

                CandidacyStatusFilter.DossierDeValidationEnvoyeHorsAbandon ->
                    candidacyCountByStatus.dossierDeValidationEnvoyeHorsAbandon

                CandidacyStatusFilter.DossierDeValidationSignaleHorsAbandon ->
                    candidacyCountByStatus.dossierDeValidationSignaleHorsAbandon

                CandidacyStatusFilter.JuryHorsAbandon ->
                    candidacyCountByStatus.juryProgrammeHorsAbandon

                CandidacyStatusFilter.JuryProgrammeHorsAbandon ->
                    candidacyCountByStatus.juryProgrammeHorsAbandon

                CandidacyStatusFilter.JuryPasseHorsAbandon ->
                    candidacyCountByStatus.juryPasseHorsAbandon

                CandidacyStatusFilter.ParcoursEnvoyeHorsAbandon ->
                    candidacyCountByStatus.parcoursEnvoyeHorsAbandon

                CandidacyStatusFilter.PriseEnChargeHorsAbandon ->
                    candidacyCountByStatus.priseEnChargeHorsAbandon

                CandidacyStatusFilter.ValidationHorsAbandon ->
                    candidacyCountByStatus.validationHorsAbandon

                CandidacyStatusFilter.ProjetHorsAbandon ->
                    candidacyCountByStatus.projetHorsAbandon

        link status label =
            viewLink context filters (count status) status label

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
            , CandidacyStatusFilter.DossierDeValidationEnvoyeHorsAbandon
            , CandidacyStatusFilter.DossierDeValidationSignaleHorsAbandon
            , CandidacyStatusFilter.DemandePaiementEnvoyeeHorsAbandon
            ]

        viewFilter : CandidacyStatusFilter -> Html msg
        viewFilter status =
            link status (candidacyStatusFilterToReadableString status)

        menuContent : List (Html msg)
        menuContent =
            List.concat
                [ [ viewFilter CandidacyStatusFilter.ActiveHorsAbandon
                  , li
                        []
                        [ ul
                            [ class "ml-3 font-normal" ]
                          <|
                            List.map viewFilter statuses
                        ]
                  ]
                , if List.member "JURY" context.activeFeatures then
                    [ viewFilter CandidacyStatusFilter.JuryHorsAbandon
                    , li
                        []
                        [ ul
                            [ class "ml-3 font-normal" ]
                          <|
                            List.map viewFilter
                                [ CandidacyStatusFilter.JuryProgrammeHorsAbandon
                                , CandidacyStatusFilter.JuryPasseHorsAbandon
                                ]
                        ]
                    ]

                  else
                    []
                , [ viewFilter CandidacyStatusFilter.DossierFaisabiliteNonRecevableHorsAbandon
                  , viewFilter CandidacyStatusFilter.Abandon
                  , viewFilter CandidacyStatusFilter.Reorientee
                  , viewFilter CandidacyStatusFilter.ArchiveHorsAbandonHorsReorientation
                  , if Api.Token.isAdmin context.token then
                        viewFilter CandidacyStatusFilter.ProjetHorsAbandon

                    else
                        text ""
                  ]
                ]
    in
    [ ul
        [ class "font-semibold text-gray-900 pb-2"
        , class "fr-sidemenu__list"
        ]
        menuContent
    ]


viewLink : Context -> Filters -> Int -> CandidacyStatusFilter -> String -> Html msg
viewLink context filters count statusFilter label =
    let
        isSelected =
            filters.status == statusFilter
    in
    li
        []
        [ a
            [ attribute "data-nav" (CandidacyStatusFilter.toString statusFilter)
            , class "block group mb-4 py-1 px-2"
            , class "flex items-start justify-between transition"
            , class "border-l-2 border-transparent"
            , classList
                [ ( "text-blue-900 border-blue-900"
                  , isSelected
                  )
                , ( "hover:text-blue-900"
                  , not isSelected
                  )
                ]
            , Route.href context.baseUrl <|
                Route.Candidacies { status = statusFilter, page = 1 }
            ]
            [ text label, viewCount count ]
        ]


viewCount : Int -> Html msg
viewCount count =
    text <| String.concat [ " (", String.fromInt count, ")" ]
