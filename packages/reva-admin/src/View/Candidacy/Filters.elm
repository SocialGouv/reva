module View.Candidacy.Filters exposing (Filters, view)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Data.Candidacy as Candidacy exposing (CandidacyCountByStatus)
import Data.Context exposing (Context)
import Html exposing (Html, a, div, label, li, span, text, ul)
import Html.Attributes exposing (class, classList, id)
import Route


type alias Filters =
    { search : Maybe String
    , status : Maybe String
    }


view :
    CandidacyCountByStatus
    -> Filters
    -> Context
    -> List (Html msg)
view candidacyCountByStatus filters context =
    let
        count : Maybe String -> Int
        count maybeStatus =
            case maybeStatus of
                Nothing ->
                    candidacyCountByStatus.activeHorsAbandon

                Just "abandon" ->
                    candidacyCountByStatus.abandon

                Just "reorientation" ->
                    candidacyCountByStatus.reorienteeHorsAbandon

                Just "archive" ->
                    candidacyCountByStatus.archiveHorsAbandonHorsReorientation

                Just "demande_paiement_envoyee" ->
                    candidacyCountByStatus.demandePaiementEnvoyeHorsAbandon

                Just "demande_financement_envoye" ->
                    candidacyCountByStatus.demandeFinancementEnvoyeHorsAbandon

                Just "parcours_confirme" ->
                    candidacyCountByStatus.parcourConfirmeHorsAbandon

                Just "parcours_envoye" ->
                    candidacyCountByStatus.parcoursEnvoyeHorsAbandon

                Just "prise_en_charge" ->
                    candidacyCountByStatus.priseEnChargeHorsAbandon

                Just "validation" ->
                    candidacyCountByStatus.validationHorsAbandon

                Just "projet" ->
                    candidacyCountByStatus.projetHorsAbandon

                Just _ ->
                    0

        link maybeStatus label =
            viewLink context filters (count maybeStatus) maybeStatus label

        statuses : List Candidacy.Step
        statuses =
            [ Validation
            , PriseEnCharge
            , ParcoursEnvoye
            , ParcoursConfirme
            , DemandeFinancementEnvoye
            , DemandePaiementEnvoyee
            ]

        viewFilter : Candidacy.Step -> Html msg
        viewFilter status =
            let
                loweredStatus =
                    status
                        |> Admin.Enum.CandidacyStatusStep.toString
                        |> String.toLower
            in
            li
                []
                [ link (Just loweredStatus) (Candidacy.statusToCategoryString status) ]
    in
    [ ul
        [ class "font-semibold text-gray-900 py-2"
        , class "fr-sidemenu__list"
        ]
        [ li
            []
            [ link Nothing "Toutes les candidatures actives"
            , li
                []
                [ ul
                    [ class "ml-3 font-normal" ]
                  <|
                    List.map viewFilter statuses
                ]
            , link (Just "abandon") "Toutes les candidatures abandonnées"
            , link (Just "reorientation") "Toutes les candidatures réorientées"
            , link (Just "archive") "Toutes les candidatures supprimées"
            , link (Just "projet") "Tous les projets en cours d'édition"
            ]
        ]
    ]


viewLink : Context -> Filters -> Int -> Maybe String -> String -> Html msg
viewLink context filters count maybeStatus label =
    let
        isSelected =
            filters.status == maybeStatus
    in
    a
        [ class "block group my-4 py-1 px-2"
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
            Route.Candidacies { status = maybeStatus }
        ]
        [ text label, viewCount count ]


viewCount : Int -> Html msg
viewCount count =
    text <| String.concat [ " (", String.fromInt count, ")" ]
