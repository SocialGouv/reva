module Data.Candidacy exposing (Candidacy)

import Data.Certification exposing (Certification)


type alias Candidacy =
    { id : String
    , deviceId : String
    , certificationId : String
    , companionId : Maybe String
    , certification : Certification
    , phone : Maybe String
    , email : Maybe String
    , createdAt : String --TODO: Time.Posix
    }
