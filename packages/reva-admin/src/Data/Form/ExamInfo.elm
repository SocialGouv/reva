module Data.Form.ExamInfo exposing (examInfo, fromDict, keys)

import Admin.Enum.ExamResult exposing (..)
import Data.ExamInfo exposing (ExamInfo, examResultFromString, examResultToString)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Scalar
import Dict exposing (Dict)


keys =
    { estimatedExamDate = "estimatedExamDate"
    , actualExamDate = "actualExamDate"
    , examResult = "examResult"
    }


fromDict : FormData -> ExamInfo
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    ExamInfo
        (decode.maybe.date .estimatedExamDate Nothing)
        (decode.maybe.date .actualExamDate Nothing)
        (decode.generic .examResult examResultFromString Nothing)


examInfo :
    Maybe Data.Scalar.Timestamp
    -> Maybe Data.Scalar.Timestamp
    -> Maybe ExamResult
    -> Dict String String
examInfo estimatedExamDate actualExamDate examResult =
    [ ( .estimatedExamDate, Maybe.map Helper.dateToString estimatedExamDate )
    , ( .actualExamDate, Maybe.map Helper.dateToString actualExamDate )
    , ( .examResult, Maybe.Just (examResultToString examResult) )
    ]
        |> Helper.toDict keys
