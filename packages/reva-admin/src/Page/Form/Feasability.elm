module Page.Form.Feasability exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    let
        elements =
            List.concat
                [ [ ( "heading"
                    , Form.Section <|
                        case candidacy.candidate of
                            Just candidate ->
                                String.concat [ candidate.firstname, " ", candidate.lastname ]

                            Nothing ->
                                ""
                    )
                  ]
                , case candidacy.certification of
                    Just certification ->
                        [ ( "heading2"
                          , Form.Section <|
                                certification.label
                          )
                        ]

                    Nothing ->
                        []
                , case candidacy.certificationAuthority of
                    Just certificationAuthority ->
                        [ ( "authoritySectionTitle"
                          , Form.Section <|
                                "Certificateur"
                          )
                        , ( "authorityLabel"
                          , Form.Section <|
                                certificationAuthority.label
                          )
                        , ( "authorityContactFullName"
                          , Form.Section <|
                                Maybe.withDefault "" certificationAuthority.contactFullName
                          )
                        , ( "authorityContactEmail"
                          , Form.Section <|
                                Maybe.withDefault "" certificationAuthority.contactEmail
                          )
                        ]

                    Nothing ->
                        [ ( "authoritySectionTitle"
                          , Form.Section <|
                                "Certificateur Inconnu"
                          )
                        ]
                ]
    in
    { elements = elements
    , saveLabel = Nothing
    , submitLabel = "Valider"
    , title = "Dossier de faisabilité"
    }
