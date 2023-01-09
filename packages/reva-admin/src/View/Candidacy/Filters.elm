module View.Candidacy.Filters exposing (view)

import Data.Candidacy as Candidacy exposing (CandidacySummary)
import Data.Context exposing (Context)
import Html.Styled exposing (Html, a, div, label, li, span, text, ul)
import Html.Styled.Attributes exposing (class, classList)
import List.Extra
import Route
import View.Candidacy.Tab


view :
    List CandidacySummary
    -> Route.Filters
    -> Context
    -> Html msg
view candidacies filters context =
    let
        isNotDroppedWithStatus : String -> CandidacySummary -> Bool
        isNotDroppedWithStatus status c =
            not c.isDroppedOut && c.lastStatus.status == String.toUpper status

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

        statuses : List String
        statuses =
            [ "VALIDATION"
            , "PRISE_EN_CHARGE"
            , "PARCOURS_ENVOYE"
            , "PARCOURS_CONFIRME"
            , "DEMANDE_FINANCEMENT_ENVOYE"
            ]

        viewFilter : String -> Html msg
        viewFilter status =
            let
                loweredStatus =
                    String.toLower status
            in
            li
                []
                [ link (Just loweredStatus) (Candidacy.statusToCategoryString status) ]
    in
    div [ class "mx-10 my-8 text-sm text-gray-600" ]
        [ ul
            [ class "font-semibold" ]
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


viewLink : Context -> Route.Filters -> Int -> Maybe String -> String -> Html msg
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
            Route.Candidacy (View.Candidacy.Tab.Empty { status = maybeStatus })
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
