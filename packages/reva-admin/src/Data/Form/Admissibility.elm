module Data.Form.Admissibility exposing (admissibility, fromDict, keys)

import Admin.Enum.AdmissibilityStatus exposing (..)
import Data.Admissibility exposing (Admissibility, admissibilitySatusFromString, admissibilitySatusToString)
import Data.Form.Helper as Helper
import Data.Scalar
import Dict exposing (Dict)


keys =
    { isCandidateAlreadyAdmissible = "isCandidateAlreadyAdmissible"
    , reportSentAt = "reportSentAt"
    , certifierRespondedAt = "certifierRespondedAt"
    , responseAvailableToCandidateAt = "responseAvailableToCandidateAt"
    , status = "status"
    }


fromDict : Dict String String -> Admissibility
fromDict dict =
    let
        decode =
            Helper.decode keys dict
    in
    Admissibility
        (decode.bool .isCandidateAlreadyAdmissible False)
        (decode.maybe.date .reportSentAt Nothing)
        (decode.maybe.date .certifierRespondedAt Nothing)
        (decode.maybe.date .responseAvailableToCandidateAt Nothing)
        (decode.generic .status admissibilitySatusFromString Nothing)


admissibility :
    Bool
    -> Maybe Data.Scalar.Timestamp
    -> Maybe Data.Scalar.Timestamp
    -> Maybe Data.Scalar.Timestamp
    -> Maybe AdmissibilityStatus
    -> Dict String String
admissibility isCandidateAlreadyAdmissible reportSentAt certifierRespondedAt responseAvailableToCandidateAt status =
    [ ( .isCandidateAlreadyAdmissible, Just <| Helper.booleanToString isCandidateAlreadyAdmissible )
    , ( .reportSentAt, Maybe.map Helper.dateToString reportSentAt )
    , ( .certifierRespondedAt, Maybe.map Helper.dateToString certifierRespondedAt )
    , ( .responseAvailableToCandidateAt, Maybe.map Helper.dateToString responseAvailableToCandidateAt )
    , ( .status, Maybe.map admissibilitySatusToString status )
    ]
        |> Helper.toDict keys
