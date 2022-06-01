module Data.CandidacySummary exposing (CandidacySummary)

import Data.Certification exposing (Certification)
import Time


type alias CandidacySummary =
    { id : String
    , deviceId : String
    , certificationId : String
    , companionId : Maybe String
    , certification : Certification
    , phone : Maybe String
    , email : Maybe String
    , createdAt : String --TODO: Time.Posix
    }
