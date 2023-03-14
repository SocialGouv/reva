module View.Candidacy.Filters exposing (Filters, view)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Data.Candidacy as Candidacy exposing (CandidacySummary)
import Data.Context exposing (Context)
import Html exposing (Html, a, div, label, li, span, text, ul)
import Html.Attributes exposing (class, classList)
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

        count : Maybe String -> Int
        count maybeStatus =
            case maybeStatus of
                Nothing ->
                    candidacies |> List.filter Candidacy.isActive |> List.length

                Just "abandon" ->
                    candidacies |> List.filter .isDroppedOut |> List.length

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
    [ div [ class "mx-2 my-8 text-sm text-gray-600" ]
        [ ul
            [ class "font-semibold"
            , class "fr-sidemenu fr-sidemenu--right"
            ]
            [ li
                []
                [ link Nothing "Toutes les candidatures actives"
                , li
                    []
                    [ ul
                        [ class "border-l ml-3 pl-2 font-normal" ]
                      <|
                        List.map viewFilter statuses
                    ]
                , link (Just "abandon") "Toutes les candidatures abandonnées"
                , link (Just "archive") "Toutes les candidatures archivées"
                , link (Just "projet") "Tous les projets en cours d'édition"
                ]
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
        [ class "block group h-10 my-2 pl-3 pr-2"
        , class "flex items-center justify-between transition"
        , classList
            [ ( "bg-gray-200 text-gray-900"
              , isSelected
              )
            , ( "hover:text-gray-900"
              , not isSelected
              )
            ]
        , Route.href context.baseUrl <|
            Route.Candidacies { status = maybeStatus }
        ]
        [ span [] [ text label ], viewCount isSelected count ]


viewCount : Bool -> Int -> Html msg
viewCount isSelected count =
    div
        [ class "flex items-center justify-center"
        , class "ml-8"
        , class "rounded-full px-2 h-6"
        , class "transition group-hover:bg-gray-300"
        , class "text-xs font-semibold"
        , classList
            [ ( "bg-gray-300 text-gray-600", isSelected )
            , ( "bg-gray-200 text-gray-500", not isSelected )
            ]
        ]
        [ text <| String.fromInt count ]
