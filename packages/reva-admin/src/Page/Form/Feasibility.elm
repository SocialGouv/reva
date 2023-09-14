module Page.Form.Feasibility exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Feasibility exposing (keys)
import Data.Referential exposing (Referential)
import Html exposing (a, div, p, strong, text)
import Html.Attributes exposing (class, href, target, title)
import Page.Form as Form exposing (Form)
import View exposing (AlertType(..))
import View.Candidate


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    let
        candidateInfo =
            ( "candidateWithCertification"
            , Form.StaticHtml <|
                div
                    [ class "mb-6" ]
                    [ View.Candidate.viewWithCertification
                        (candidacy.certification |> Maybe.map .label)
                        candidacy.candidate
                    ]
            )

        idCardWarning =
            ( "id-card-warning"
            , Form.StaticHtml <|
                View.alert Warning
                    [ class "mt-4 mb-10" ]
                    "Attention"
                    [ p []
                        [ text "Ne joignez pas la Carte d’Identité du candidat dans ce formulaire. Pour le moment"
                        , strong [] [ text ", la Carte d’Identité est toujours à communiquer par email." ]
                        ]
                    ]
            )

        certificationAuthorities =
            candidacy.certificationAuthorities
                |> List.map (\c -> ( c.id, c.label ))

        helpPanel =
            ( "help panel"
            , Form.StaticHtml
                (View.noticeInfo
                    [ class "mt-4" ]
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
                )
            )

        noCertificationAuthorityWarning =
            ( "no-certification-authority-warning"
            , Form.StaticHtml <|
                View.alert Warning
                    [ class "mt-8" ]
                    "Attention"
                    [ p []
                        [ text "Aucun certificateur n'est actuellement rattaché à cette certification pour le département de la candidature. Il n'est donc pas actuellement possible de remplir le dossier de faisabilité."
                        ]
                    ]
            )

        elements =
            if List.isEmpty candidacy.certificationAuthorities then
                [ candidateInfo, noCertificationAuthorityWarning ]

            else
                [ candidateInfo
                , ( "", Form.Title1 "Pièces jointes" )
                , idCardWarning
                , ( "feasibilityFile", Form.Title2 "1 - Joindre le dossier de faisabilité" )
                , ( keys.feasibilityFile, Form.File "" "Format supporté : PDF uniquement" )
                , ( "documentaryProofFile", Form.Title2 "2 - Joindre une autre pièce (optionnel)" )
                , ( keys.documentaryProofFile, Form.File "Copie du ou des justificatif(s) ouvrant accès à une équivalence ou dispense en lien avec la certification visée." "Format supporté : PDF uniquement" )
                , ( "certificateOfAttendanceFile", Form.Title2 "3 - Joindre une autre pièce (optionnel)" )
                , ( keys.certificateOfAttendanceFile, Form.File "Attestation ou certificat de suivi de formation dans le cas du pré-requis demandé par la certification visée." "Format supporté : PDF uniquement" )
                , ( "", Form.Title1 "Autorité de certification" )
                , ( keys.certificationAuthorityId, Form.Select "Sélectionnez l'autorité certificatrice" certificationAuthorities )
                , helpPanel
                ]
    in
    { elements = elements
    , saveLabel = Nothing
    , submitLabel = "Valider"
    , title = "Dossier de faisabilité"
    }
