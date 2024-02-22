module View.Feasibility.Decision exposing (view)

import Accessibility exposing (div, h3, p, text)
import Data.Feasibility exposing (Decision(..), Feasibility)
import Html exposing (Html)
import Html.Attributes exposing (class)
import Time exposing (Posix)
import View
import View.Date


view : { a | decision : Decision, decisionSentAt : Maybe Posix } -> Html msg
view feasibility =
    case feasibility.decision of
        Pending ->
            div []
                [ p [ class "mb-0 italic" ]
                    [ text "En attente" ]
                ]

        Rejected reason ->
            viewDecision "Non recevable"
                "Dossier rejeté le"
                feasibility.decisionSentAt
                reason

        Admissible reason ->
            viewDecision "Recevable"
                "Dossier validé le"
                feasibility.decisionSentAt
                reason

        Incomplete reason ->
            viewDecision "Dossier incomplet"
                "Dossier marqué incomplet le"
                feasibility.decisionSentAt
                reason


viewDecision : String -> String -> Maybe Posix -> String -> Html msg
viewDecision decision datePrefix maybeDate reason =
    let
        subTitle s =
            h3
                [ class "font-bold text-xl text-gray-900 mb-1" ]
                [ text s ]
    in
    div []
        [ subTitle decision
        , case maybeDate of
            Just date ->
                p
                    [ class "mb-4" ]
                    [ text <|
                        String.concat
                            [ datePrefix
                            , " "
                            , View.Date.toSmallFormat date
                            ]
                    ]

            Nothing ->
                text ""
        , subTitle "Motifs de la décision"
        , if reason == "" then
            p [ class "mb-0 italic" ] [ text "Motifs non précisés" ]

          else
            p [ class "mb-0" ] [ text reason ]
        ]


viewGrayBlock : List (Html msg) -> Html msg
viewGrayBlock =
    div
        [ class "bg-neutral-100 text-lg px-8 pt-2 pb-8 w-full" ]
