module View.Candidate exposing (..)

import Accessibility exposing (div, h3, h4, text)
import Data.Feasibility exposing (Candidate)
import Html exposing (Html)
import Html.Attributes exposing (class)


viewWithCertification : Maybe String -> Maybe { a | firstname : String, lastname : String } -> Html msg
viewWithCertification maybeCertificationLabel maybeCandidate =
    div
        []
        [ h3
            [ class "text-3xl mb-6" ]
            [ text
                (case maybeCandidate of
                    Just candidate ->
                        String.concat [ candidate.firstname, " ", candidate.lastname ]

                    Nothing ->
                        ""
                )
            ]
        , h4
            [ class "mb-0" ]
            [ text <| Maybe.withDefault "Certification inconnue" maybeCertificationLabel ]
        ]
