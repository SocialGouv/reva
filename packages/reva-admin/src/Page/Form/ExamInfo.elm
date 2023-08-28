module Page.Form.ExamInfo exposing (..)

import Admin.Enum.ExamResult exposing (..)
import Data.Candidacy exposing (Candidacy)
import Data.ExamInfo exposing (examResultToString)
import Data.Form exposing (FormData)
import Data.Form.ExamInfo
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form formData _ =
    let
        keys =
            Data.Form.ExamInfo.keys

        examResultList =
            [ ( "Non renseigné", Nothing )
            , ( "Réussite", Just Success )
            , ( "Réussite partielle", Just PartialSuccess )
            , ( "Réussite à une demande initiale de certification partielle", Just PartialCertificationSuccess )
            , ( "Échec", Just Failure )
            ]
                |> List.map (\( id, result ) -> ( id, examResultToString result ))

        elements =
            [ ( "dates", Form.Title1 "1 - Dates de passage devant le jury" )
            , ( keys.estimatedExamDate, Form.Date "Date prévisionnelle" )
            , ( keys.actualExamDate, Form.Date "Date réelle" )
            , ( "result", Form.Title1 "2 - Résultat" )
            , ( keys.examResult, Form.Select "Résultat obtenu par le candidat" examResultList )
            ]
    in
    { elements = elements
    , saveLabel = Nothing
    , submitLabel = "Valider"
    , title = "Jury"
    }
