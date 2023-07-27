module Page.Form.Feasibility exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Feasibility exposing (keys)
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    let
        feasibilityFileNameAndUrl =
            Maybe.withDefault ( "", "" ) <|
                Maybe.map (\f -> ( f.feasibilityFile.name, f.feasibilityFile.url )) candidacy.feasibility

        otherFileNameAndUrl =
            case candidacy.feasibility of
                Just feasibility ->
                    case feasibility.otherFile of
                        Just otherFile ->
                            ( otherFile.name, otherFile.url )

                        Nothing ->
                            ( "", "" )

                Nothing ->
                    ( "", "" )

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
                            "font-bold text-2xl pl-2"
                        )
                    )
                  ]
                , case candidacy.certification of
                    Just certification ->
                        [ ( "certificationLabel"
                          , Form.Text
                                certification.label
                                (Just
                                    "font-bold text-xl mb-6 pl-2"
                                )
                          )
                        ]

                    Nothing ->
                        []
                , [ ( "feasibilityFile", Form.Title "Dossier de faisabilité" )
                  , ( keys.feasibilityFile, Form.File "Joindre le dossier de faisabilité" "Format supporté : PDF uniquement" (Tuple.first feasibilityFileNameAndUrl) (Tuple.second feasibilityFileNameAndUrl) )
                  , ( "otherFile", Form.Title "Autre pièce jointe" )
                  , ( keys.otherFile, Form.File "Joindre une autre pièce (si besoin)" "Format supporté : PDF uniquement" (Tuple.first otherFileNameAndUrl) (Tuple.second otherFileNameAndUrl) )
                  ]
                , case candidacy.certificationAuthority of
                    Just certificationAuthority ->
                        [ ( "authoritySectionTitle", Form.Title "Certificateur" )
                        , ( "authorityLabel"
                          , Form.Text
                                certificationAuthority.label
                                (Just
                                    "font-bold text-xl pl-2"
                                )
                          )
                        , ( "authorityContactFullName"
                          , Form.Text
                                (Maybe.withDefault "" certificationAuthority.contactFullName)
                                (Just "pl-2")
                          )
                        , ( "authorityContactEmail"
                          , Form.Text
                                (Maybe.withDefault "" certificationAuthority.contactEmail)
                                (Just "pl-2")
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
