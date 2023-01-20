module Data.Form.Candidate exposing (candidate, fromDict, keys)

import Admin.Enum.Gender exposing (Gender(..))
import Data.Candidate exposing (genderFromString, genderToString)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Dict exposing (Dict)


type alias CandidateInput =
    { id : String
    , firstname : String
    , firstname2 : Maybe String
    , firstname3 : Maybe String
    , gender : Gender
    , highestDegreeId : Maybe String
    , lastname : String
    , vulnerabilityIndicatorId : Maybe String
    }


keys =
    { id = "id"
    , firstname = "firstname"
    , firstname2 = "firstname2"
    , firstname3 = "firstname3"
    , gender = "gender"
    , highestDegree = "highestDegree"
    , lastname = "lastname"
    , vulnerabilityIndicator = "vulnerabilityIndicator"
    }


fromDict : FormData -> CandidateInput
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    CandidateInput
        (decode.string .id "")
        (decode.string .firstname "")
        (decode.maybe.string .firstname2)
        (decode.maybe.string .firstname3)
        (decode.generic .gender genderFromString Undisclosed)
        (decode.maybe.string .highestDegree)
        (decode.string .lastname "")
        (decode.maybe.string .vulnerabilityIndicator)


candidate :
    String
    -> String
    -> Maybe String
    -> Maybe String
    -> Maybe Gender
    -> Maybe String
    -> String
    -> Maybe String
    -> Dict String String
candidate id firstname firstname2 firstname3 gender highestDegreeId lastname vulnerabilityIndicatorId =
    [ ( .id, Just id )
    , ( .firstname, Just firstname )
    , ( .firstname2, firstname2 )
    , ( .firstname3, firstname3 )
    , ( .gender, Maybe.map genderToString gender )
    , ( .highestDegree, highestDegreeId )
    , ( .lastname, Just lastname )
    , ( .vulnerabilityIndicator, vulnerabilityIndicatorId )
    ]
        |> Helper.toDict keys
