module Page.Form.Feasibility exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Feasibility exposing (keys)
import Data.Referential exposing (Referential)
import Html exposing (a, div, h6, p, strong, text)
import Html.Attributes exposing (class, href, target, title)
import Html.Attributes.Extra exposing (role)
import Page.Form as Form exposing (Form)
import View.Candidate


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    let
        candidateInfo =
            ( "candidateWithCertification"
            , Form.StaticHtml <|
                div
                    [ class "pl-2 mb-6" ]
                    [ View.Candidate.viewWithCertification
                        (candidacy.certification |> Maybe.map .label)
                        candidacy.candidate
                    ]
            )

        idCardWarning =
            ( "id-card-warning"
            , Form.StaticHtml
                (div
                    [ class "fr-alert fr-alert--warning ml-2 mt-2 mb-8", role "alert" ]
                    [ h6 [] [ text "Attention" ]
                    , p []
                        [ text "Ne joignez pas la Carte d’Identité du candidat dans ce formulaire. Pour le moment"
                        , strong [] [ text ", la Carte d’Identité est toujours à communiquer par email." ]
                        ]
                    ]
                )
            )

        helpPanel =
            [ ( "help panel"
              , Form.StaticHtml
                    (div
                        [ class "fr-notice fr-notice--info ml-2 mt-10" ]
                        [ div [ class "fr-container" ]
                            [ div [ class "fr-notice__body" ]
                                [ div [ class "fr-notice__title" ]
                                    [ text "Pour retrouver les dossiers de faisabilité et être guidé dans le remplissage, "
                                    , a
                                        [ class "fr-link text-[#0063cb]"
                                        , href "https://www.notion.so/Dossiers-de-faisabilit-c5bff6e7fa7744859cda85c935fd928f"
                                        , target "_blank"
                                        , title "consultez la documentation - nouvelle fenêtre"
                                        ]
                                        [ text "consultez la documentation" ]
                                    , text " ou "
                                    , a
                                        [ class "fr-link text-[#0063cb]"
                                        , href "https://www.notion.so/NOTICE-D-UTILISATION-DU-DOSSIER-DE-FAISABILITE-92a8744b294a47259396fe1efd226043"
                                        , target "_blank"
                                        , title "la notice d’utilisation du dossier de faisabilité - nouvelle fenêtre"
                                        ]
                                        [ text "la notice d’utilisation du dossier de faisabilité" ]
                                    , text "."
                                    ]
                                ]
                            ]
                        ]
                    )
              )
            ]

        elements =
            List.concat
                [ [ candidateInfo
                  , idCardWarning
                  , ( "feasibilityFile", Form.Title "Dossier de faisabilité" )
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
                , helpPanel
                ]
    in
    { elements = elements
    , saveLabel = Nothing
    , submitLabel = "Valider"
    , title = "Dossier de faisabilité"
    }
