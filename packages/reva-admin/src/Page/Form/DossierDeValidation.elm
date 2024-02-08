module Page.Form.DossierDeValidation exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.DossierDeValidation
import Data.Referential exposing (Referential)
import Html exposing (div, h2, p, text)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)
import Time
import View
import View.Date as Date


form : FormData -> ( Candidacy, Referential ) -> Form
form formData ( candidacy, _ ) =
    let
        keys =
            Data.Form.DossierDeValidation.keys

        problemSignaledSection =
            case candidacy.activeDossierDeValidation of
                Just dossierDeValidation ->
                    [ ( "problemSignaledWarning"
                      , Form.StaticHtml <|
                            View.alert View.Warning
                                [ class "my-10" ]
                                "Dossier de validation signalé par le certificateur"
                                [ p [] [ text "Ce dossier de validation a été signalé comme comportant des erreurs par le certificateur. Les détails du signalement sont disponibles ci-dessous. Merci de retourner rapidement un dossier valide." ]
                                ]
                      )
                    , ( "dossierDeValidationSentAt"
                      , Form.StaticHtml <|
                            p
                                [ class "font-bold" ]
                                [ text <|
                                    "Dossier envoyé le "
                                        ++ Date.toSmallFormat
                                            dossierDeValidation.dossierDeValidationSentAt
                                ]
                      )
                    , toHistoryEntry dossierDeValidation
                    ]
                        ++ List.map
                            toHistoryEntry
                            dossierDeValidation.history

                _ ->
                    [ ( "problemSignaledWarning", Form.StaticHtml <| text "" ) ]

        filesChecklistTitle =
            ( ""
            , Form.StaticHtml <|
                div
                    [ class "mt-6 -mb-8"
                    , class "pt-6 px-8 bg-neutral-100 w-full"
                    , class "[&+div]:!w-full [&+div]:!mr-0 [&+div]:bg-neutral-100 [&+div]:px-8"
                    ]
                    [ h2 [ class "text-xl" ] [ text "Avant de finaliser l' envoi :" ] ]
            )

        isFileEmpty formFileIndex =
            List.isEmpty (Data.Form.getFiles (keys.dossierDeValidationOtherFiles ++ String.fromInt formFileIndex) formData)

        otherFilePickersCount =
            List.range 1 4
                |> List.foldl
                    (\formFileIndex acc ->
                        acc
                            + (if isFileEmpty formFileIndex then
                                0

                               else
                                1
                              )
                    )
                    0

        otherFilePickerElements =
            List.range 0 otherFilePickersCount |> List.map (\i -> ( keys.dossierDeValidationOtherFiles ++ String.fromInt (i + 1), Form.File "" "Format supporté : PDF uniquement avec un poids maximum de 10 Mo" ))

        filesChecklist =
            if otherFilePickersCount == 0 then
                [ ( keys.dossierDeValidationFileCheck
                  , "J’ai bien vérifié que le dossier de validation était complet et lisible."
                  )
                ]

            else
                [ ( keys.dossierDeValidationFileCheck
                  , "J’ai bien vérifié que le dossier de validation était complet et lisible."
                  )
                , ( keys.otherFilesCheck
                  , "J’ai bien vérifié que tous les autres documents étaient lisibles."
                  )
                ]
    in
    { elements =
        ( ""
        , Form.Text "Le dossier de validation doit être rédigé par le candidat. Des pièces supplémentaires peuvent être ajoutées selon les attendus du certificateur (ex : attestation de premiers secours). " Nothing
        )
            :: problemSignaledSection
            ++ [ ( "", Form.Title1 "Joindre le dossier de validation" )
               , ( keys.dossierDeValidationFile, Form.FileRequired "" "Format supporté : PDF uniquement avec un poids maximum de 10Mo" )
               , ( "", Form.Title1 "Joindre des pièces supplémentaires (optionnel)" )
               ]
            ++ otherFilePickerElements
            ++ [ filesChecklistTitle
               , ( "filesChecklist", Form.CheckboxList "" filesChecklist )
               ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer les documents"
    , title = ""
    }


toHistoryEntry : { a | decisionSentAt : Maybe Time.Posix, decisionComment : Maybe String } -> ( String, Form.Element )
toHistoryEntry h =
    ( "dossierDeValidationHistoryEntry"
    , Form.StaticHtml <|
        div [ class "flex flex-col bg-neutral-100 p-8 mb-6" ]
            [ p
                [ class "font-bold mb-2 text-xl" ]
                [ text
                    "Dossier signalé : "
                ]
            , p
                []
                [ text <|
                    "Dossier signalé le "
                        ++ (case h.decisionSentAt of
                                Just date ->
                                    Date.toSmallFormat date

                                Nothing ->
                                    "date inconnue"
                           )
                ]
            , p
                [ class "font-bold mb-2 text-xl" ]
                [ text
                    "Motif du signalement : "
                ]
            , p
                [ class "mb-0" ]
                [ text <|
                    Maybe.withDefault "" h.decisionComment
                ]
            ]
    )
