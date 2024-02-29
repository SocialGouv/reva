module Page.Form.Feasibility exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Feasibility exposing (keys)
import Data.Referential exposing (Referential)
import Html exposing (a, div, h2, p, span, strong, text)
import Html.Attributes exposing (class, href, target, title)
import Page.Form as Form exposing (Form)
import View exposing (AlertType(..))
import View.Candidate
import View.Feasibility.Decision


form : FormData -> ( Candidacy, Referential ) -> Form
form formData ( candidacy, _ ) =
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

        certificationAuthorityIds =
            candidacy.certificationAuthorities
                |> List.map (\c -> ( c.id, c.label ))

        subTitle extraClass s =
            h2
                [ class "text-2xl mb-3", class extraClass ]
                [ text s ]

        certificationAuthorityView certificationAuthority =
            div [ class "w-full" ]
                [ subTitle "-mt-4" "Autorité de certification"
                , View.Candidate.viewCertificationAuthority certificationAuthority
                ]

        decisionHistoryView =
            case candidacy.feasibility of
                Just feasibility ->
                    let
                        decisionWithHistory =
                            { decision = feasibility.decision
                            , decisionSentAt = feasibility.decisionSentAt
                            }
                                :: feasibility.history
                    in
                    div [ class "w-full mt-6" ]
                        [ if List.length decisionWithHistory == 1 then
                            subTitle "mt-2" "Décision précédente"

                          else
                            subTitle "mt-2" "Décisions précédentes"
                        , View.summaryBlockWithItems (List.map View.Feasibility.Decision.view decisionWithHistory)
                        ]

                Nothing ->
                    text ""

        helpPanelHeader =
            ( "help panel header"
            , Form.StaticHtml <|
                View.alert View.Info
                    [ class "mb-10" ]
                    ""
                    [ p []
                        [ span []
                            [ text "Si vous ne joignez pas la bonne pièce, cliquez à nouveau sur le bouton"
                            ]
                        , strong [ class "italic" ]
                            [ text " “Parcourir” "
                            ]
                        , span []
                            [ text "pour la remplacer par la pièce valide."
                            ]
                        ]
                    ]
            )

        helpPanelFooter =
            ( "help panel footer"
            , Form.StaticHtml
                (View.noticeInfo
                    [ class "mt-10" ]
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

        filesChecklistBlockEffect =
            ( ""
            , Form.StaticHtml <|
                div
                    [ class "-mb-2"
                    , class "pt-4 px-8 bg-neutral-100 w-full"
                    , class "[&+div]:!w-full [&+div]:!mr-0 [&+div]:bg-neutral-100 [&+div]:px-8"
                    ]
                    []
            )

        filesChecklist =
            ( keys.feasibilityFileChecked
            , "J'ai bien vérifié que le dossier de faisabilité était correct, complet et signé par moi-même ainsi que par le candidat."
            )
                :: ( keys.iDFileChecked
                   , "J'ai bien vérifié que la pièce d’identité était conforme, en cours de validité et lisible."
                   )
                :: (if Data.Form.Feasibility.hasOptionalFiles formData then
                        [ ( keys.optionalFileChecked, "J'ai bien vérifié que les éventuelles pièces jointes optionnelles étaient correctes et complètes." ) ]

                    else
                        []
                   )

        elements =
            if List.isEmpty candidacy.certificationAuthorities then
                [ candidateInfo, noCertificationAuthorityWarning ]

            else
                [ candidateInfo
                , ( "", Form.Title1 "Pièces jointes" )
                , helpPanelHeader
                , ( "feasibilityFile", Form.Title2 "Joindre le dossier de faisabilité" )
                , ( keys.feasibilityFile, Form.FileRequired "Le dossier doit être complet et signé par vous-même et le candidat. Pensez à vérifier que vous avez tout saisi avant l’envoi." "Format supporté : PDF uniquement" )
                , ( "idFile", Form.Title2 "Joindre la pièce d’identité (carte identité, passeport, carte de séjour)" )
                , ( keys.idFile, Form.FileRequired "Copie ou scan lisible (la photo ne doit pas être floue) et en cours de validité. Cette pièce sera demandée au candidat pour justifier de son identité lors du passage devant jury et la délivrance éventuelle du diplôme." "Format supporté : PDF, JPG, JPEG, PNG" )
                , ( "documentaryProofFile", Form.Title2 "Joindre une autre pièce (optionnel)" )
                , ( keys.documentaryProofFile, Form.File "Copie du ou des justificatif(s) ouvrant accès à une équivalence ou dispense en lien avec la certification visée." "Format supporté : PDF uniquement" )
                , ( "certificateOfAttendanceFile", Form.Title2 "Joindre une autre pièce (optionnel)" )
                , ( keys.certificateOfAttendanceFile, Form.File "Attestation ou certificat de suivi de formation dans le cas du pré-requis demandé par la certification visée." "Format supporté : PDF uniquement" )
                , ( "", Form.Title1 "" )
                , case candidacy.certificationAuthorities of
                    [ certificationAuthority ] ->
                        ( "certificationAuthority", Form.StaticHtml (certificationAuthorityView certificationAuthority) )

                    _ ->
                        ( keys.certificationAuthorityId
                        , Form.Select "Sélectionnez l'autorité de certification" certificationAuthorityIds
                        )
                , ( "", Form.StaticHtml decisionHistoryView )
                , ( "", Form.StaticHtml (subTitle "mt-8" "Avant de finaliser votre envoi") )
                , filesChecklistBlockEffect
                , ( "filesChecklist", Form.CheckboxList "" filesChecklist )
                , helpPanelFooter
                ]
    in
    { elements = elements
    , saveLabel = Nothing
    , submitLabel = "Valider"
    , title = "Dossier de faisabilité"
    }
