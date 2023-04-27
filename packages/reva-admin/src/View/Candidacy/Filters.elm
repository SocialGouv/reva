module View.Candidacy.Filters exposing (Filters, view)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Admin.Object.CandidacySummary exposing (isReorientation)
import Data.Candidacy as Candidacy exposing (CandidacySummary)
import Data.Context exposing (Context)
import Html exposing (Html, a, div, label, li, span, text, ul)
import Html.Attributes exposing (class, classList, id)
import List.Extra
import Route


type alias Filters =
    { search : Maybe String
    , status : Maybe String
    }


view :
    List CandidacySummary
    -> Filters
    -> Context
    -> List (Html msg)
view candidacies filters context =
    let
        isNotDroppedWithStatus : String -> CandidacySummary -> Bool
        isNotDroppedWithStatus status c =
            not c.isDroppedOut
                && Just c.lastStatus.status
                == (status |> String.toUpper |> Admin.Enum.CandidacyStatusStep.fromString)

        isNotReorientation : CandidacySummary -> Bool
        isNotReorientation c =
            not c.isReorientation

        count : Maybe String -> Int
        count maybeStatus =
            case maybeStatus of
                Nothing ->
                    candidacies |> List.filter Candidacy.isActive |> List.length

                Just "abandon" ->
                    candidacies |> List.filter .isDroppedOut |> List.length

                Just "reorientation" ->
                    candidacies |> List.filter .isReorientation |> List.length

                Just "archive" ->
                    candidacies |> List.filter (isNotDroppedWithStatus "archive") |> List.filter isNotReorientation |> List.length

                Just status ->
                    candidacies |> List.Extra.count (isNotDroppedWithStatus status)

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
            , link (Just "archive") "Toutes les candidatures archivées"
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
