module View.Feasibility.Decision exposing (view)

import Accessibility exposing (div, p, text)
import Data.Feasibility exposing (Decision(..))
import Html exposing (Html)
import Html.Attributes exposing (class)
import Time exposing (Posix)
import View
import View.Date


view : { a | decision : Decision, decisionSentAt : Maybe Posix } -> Html msg
view feasibility =
    case feasibility.decision of
        Pending ->
            text ""

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
    div
        [ class "flex flex-col mb-2 gap-y-8" ]
        [ View.summaryBlock "Décision prise concernant ce dossier"
            [ p
                [ class "font-semibold text-lg text-gray-900 mb-4" ]
                [ text decision ]
            , case maybeDate of
                Just date ->
                    p
                        [ class "mb-0" ]
                        [ text <|
                            String.concat
                                [ datePrefix
                                , " "
                                , View.Date.toSmallFormat date
                                ]
                        ]

                Nothing ->
                    text ""
            ]
        , View.summaryBlock "Motifs de la décision"
            [ if reason == "" then
                p [ class "mb-0 italic" ] [ text "Motifs non précisés" ]

              else
                p [ class "mb-0" ] [ text reason ]
            ]
        ]
