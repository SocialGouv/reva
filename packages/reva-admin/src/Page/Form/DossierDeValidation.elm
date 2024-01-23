module Page.Form.DossierDeValidation exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.DossierDeValidation
import Data.Referential exposing (Referential)
import Html exposing (div, h2, text)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
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
    in
    { elements =
        [ ( ""
          , Form.Text "Le dossier de validation doit être rédigé par le candidat.Des pièces jointes supplémentaires peuvent être ajoutées selon les attendus du certificateur." Nothing
          )
        , ( "", Form.Title1 "Pièces jointes" )
        , ( keys.dossierDeValidationFile, Form.FileRequired "Joindre le dossier de validation" "Format supporté : PDF uniquement avec un poids maximum de 2Mo" )
        , filesChecklistTitle
        , ( "filesChecklist", Form.CheckboxList "" filesChecklist )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Dossier de validation"
    }
