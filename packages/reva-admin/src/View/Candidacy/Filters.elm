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
        count : Maybe String -> Int
        count maybeStatus =
            case maybeStatus of
                Nothing ->
                    candidacies |> List.length

                Just "abandon" ->
                    candidacies |> List.filter .isDroppedOut |> List.length

                Just status ->
                    candidacies
                        |> List.Extra.count (\c -> c.lastStatus.status == String.toUpper status)

        statuses : List String
        statuses =
            [ "VALIDATION"
            , "PRISE_EN_CHARGE"
            , "PARCOURS_ENVOYE"
            , "PARCOURS_CONFIRME"
            , "DEMANDE_FINANCEMENT_ENVOYE"
            , "PROJET"
            , "ARCHIVE"
            ]

        viewLink : Maybe String -> String -> Html msg
        viewLink maybeStatus label =
            a
                [ class "block py-2 px-3"
                , class "flex justify-between"
                , classList
                    [ ( "bg-gray-200 text-gray-900"
                      , filters.status == maybeStatus
                      )
                    , ( "hover:text-gray-900"
                      , filters.status /= maybeStatus
                      )
                    ]
                , Route.href context.baseUrl <|
                    Route.Candidacy (View.Candidacy.Tab.Empty { status = maybeStatus })
                ]
                [ span [] [ text label ], viewCount (count maybeStatus) ]

        viewFilter : String -> Html msg
        viewFilter status =
            let
                loweredStatus =
                    String.toLower status
            in
            li
                []
                [ viewLink (Just loweredStatus) (Candidacy.statusToCategoryString status) ]
    in
    div [ class "m-6 text-sm text-gray-600" ]
        [ ul
            [ class "border-b pb-4 mb-4" ]
            [ li
                []
                [ viewLink Nothing "Toutes les candidatures actives"
                , viewLink (Just "abandon") "Toutes les candidatures abandonnées"
                ]
            ]
        , ul [] <| List.map viewFilter statuses
        ]


viewCount : Int -> Html msg
viewCount count =
    div
        [ class "flex items-center justify-center"
        , class "ml-8"
        , class "rounded-full px-2 h-6 bg-gray-300"
        , class "text-xs font-semibold text-gray-600"
        ]
        [ text <| String.fromInt count ]
