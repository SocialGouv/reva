module Page.Form.Feasibility exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Feasibility exposing (keys)
import Data.Referential exposing (Referential)
import Html exposing (div, h6, p, strong, text)
import Html.Attributes exposing (class)
import Html.Attributes.Extra exposing (role)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    let
        idCardWarning =
            [ ( "id-card-warning"
              , Form.StaticHtml
                    (div
                        [ class "fr-alert fr-alert--warning ml-2 mt-2 mb-8", role "alert" ]
                        [ h6 [] [ text "Attention" ]
                        , p [] [ text "Ne joignez pas la Carte d’Identité du candidat dans ce formulaire. Pour le moment", strong [] [ text ", la Carte d’Identité est toujours à communiquer par email." ] ]
                        ]
                    )
              )
            ]

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
                , idCardWarning
                , [ ( "feasibilityFile", Form.Title "Dossier de faisabilité" )
                  , ( keys.feasibilityFile, Form.File "Joindre le dossier de faisabilité" "Format supporté : PDF uniquement" )
                  , ( "otherFile", Form.Title "Autre pièce jointe" )
                  , ( keys.otherFile, Form.File "Joindre une autre pièce (si besoin)" "Format supporté : PDF uniquement" )
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
