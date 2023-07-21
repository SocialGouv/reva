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
                [ [ ( "candidateFullName"
                    , Form.Text
                        (case candidacy.candidate of
                            Just candidate ->
                                String.concat [ candidate.firstname, " ", candidate.lastname ]

                            Nothing ->
                                ""
                        )
                        (Just
                            "font-bold text-2xl"
                        )
                    )
                  ]
                , case candidacy.certification of
                    Just certification ->
                        [ ( "certificationLabel"
                          , Form.Text
                                certification.label
                                (Just
                                    "font-bold text-xl"
                                )
                          )
                        ]

                    Nothing ->
                        []
                , case candidacy.certificationAuthority of
                    Just certificationAuthority ->
                        [ ( "authorityPanel"
                          , Form.Panel
                                [ ( "authoritySectionTitle"
                                  , Form.Text
                                        "Certificateur"
                                        (Just
                                            "font-bold text-xl"
                                        )
                                  )
                                , ( "authorityLabel"
                                  , Form.Text
                                        certificationAuthority.label
                                        (Just
                                            "font-bold text-xl"
                                        )
                                  )
                                , ( "authorityContactFullName"
                                  , Form.Text
                                        (Maybe.withDefault "" certificationAuthority.contactFullName)
                                        Nothing
                                  )
                                , ( "authorityContactEmail"
                                  , Form.Text
                                        (Maybe.withDefault "" certificationAuthority.contactEmail)
                                        Nothing
                                  )
                                ]
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
