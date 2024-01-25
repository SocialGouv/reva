module Page.Form.DossierDeValidation exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.DossierDeValidation
import Data.Referential exposing (Referential)
import Html exposing (div, h2, text)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form formData ( candidacy, _ ) =
    let
        keys =
            Data.Form.DossierDeValidation.keys

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

        filesChecklist =
            [ ( keys.dossierDeValidationFileCheck
              , "J’ai bien vérifié que le dossier de validation était complet et lisible."
              )
            , ( keys.otherFilesCheck
              , "J’ai bien vérifié que tous les autres documents étaient lisibles."
              )
            ]

        isFileEmpty formFileIndex =
            List.isEmpty (Data.Form.getFiles (keys.dossierDeValidationOtherFiles ++ String.fromInt formFileIndex) formData)

        otherFilePickersCount =
            List.range 1 5
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
    in
    { elements =
        [ ( ""
          , Form.Text "Le dossier de validation doit être rédigé par le candidat. Des pièces supplémentaires peuvent être ajoutées selon les attendus du certificateur (ex : attestation de premiers secours). " Nothing
          )
        , ( "", Form.Title1 "Joindre le dossier de validation" )
        , ( keys.dossierDeValidationFile, Form.FileRequired "" "Format supporté : PDF uniquement avec un poids maximum de 2Mo" )
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
