module Data.ExamInfo exposing (ExamInfo, examResultFromString, examResultToString)

import Admin.Enum.ExamResult exposing (..)
import Data.Scalar exposing (Timestamp)


type alias ExamInfo =
    { estimatedExamDate : Maybe Timestamp
    , actualExamDate : Maybe Timestamp
    , examResult : Maybe ExamResult
    }


examResultFromString : String -> Maybe ExamResult
examResultFromString examResult =
    case examResult of
        "Réussite" ->
            Just Success

        "Réussite partielle" ->
            Just PartialSuccess

        "Réussite à une demande initiale de certification partielle" ->
            Just PartialCertificationSuccess

        "Échec" ->
            Just Failure

        _ ->
            Nothing


examResultToString : Maybe ExamResult -> String
examResultToString examResult =
    case examResult of
        Nothing ->
            "Non renseigné"

        Just Success ->
            "Réussite"

        Just PartialSuccess ->
            "Réussite partielle"

        Just PartialCertificationSuccess ->
            "Réussite à une demande initiale de certification partielle"

        Just Failure ->
            "Échec"
