module View.Candidate exposing (..)

import Accessibility exposing (div, h2, h3, h6, p, text)
import Data.CertificationAuthority exposing (CertificationAuthority)
import Html exposing (Html)
import Html.Attributes exposing (class)
import View


viewWithCertification : Maybe String -> Maybe { a | firstname : String, lastname : String } -> Html msg
viewWithCertification maybeCertificationLabel maybeCandidate =
    div
        []
        [ h2
            [ class "text-3xl mb-6" ]
            [ text
                (case maybeCandidate of
                    Just candidate ->
                        String.concat [ candidate.firstname, " ", candidate.lastname ]

                    Nothing ->
                        ""
                )
            ]
        , h3
            [ class "text-2xl mb-0" ]
            [ text <| Maybe.withDefault "Certification inconnue" maybeCertificationLabel ]
        ]


viewCertificationAuthority : CertificationAuthority -> Html msg
viewCertificationAuthority certificationAuthority =
    View.summaryBlock "Certificateur" <|
        [ h6
            [ class "text-xl mb-4" ]
            [ text certificationAuthority.label ]
        , certificationAuthority.contactFullName
            |> Maybe.map (\name -> p [ class "text-lg mb-4" ] [ text name ])
            |> Maybe.withDefault (text "")
        , certificationAuthority.contactEmail
            |> Maybe.map (\email -> p [ class "text-lg mb-0" ] [ text email ])
            |> Maybe.withDefault (text "")
        ]
