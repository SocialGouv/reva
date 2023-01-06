module View.Candidacy.Filters exposing (view)

import Data.Candidacy as Candidacy
import Data.Context exposing (Context)
import Html.Styled exposing (Html, a, div, label, li, text, ul)
import Html.Styled.Attributes exposing (class, classList)
import Route
import View.Candidacy.Tab


view : Route.Filters -> Context -> Html msg
view filters context =
    let
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
                [ text label ]

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
