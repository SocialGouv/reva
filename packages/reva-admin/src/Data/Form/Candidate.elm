module Data.Form.Candidate exposing (candidate, fromDict, keys)

import Admin.Enum.Gender exposing (Gender(..))
import Data.Candidate exposing (genderFromString, genderToString)
import Data.Form.Helper as Helper
import Dict exposing (Dict)


type alias CandidateInput =
    { id : String
    , firstname : String
    , firstname2 : Maybe String
    , firstname3 : Maybe String
    , gender : Gender
    , highestDegreeId : String
    , lastname : String
    , vulnerabilityIndicatorId : String
    }


keys :
    { id : String
    , firstname : String
    , firstname2 : String
    , firstname3 : String
    , gender : String
    , highestDegree : String
    , lastname : String
    , vulnerabilityIndicator : String
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


fromDict : Dict String String -> CandidateInput
fromDict dict =
    let
        decode =
            Helper.decode keys dict
    in
    CandidateInput
        (decode.string .id "")
        (decode.string .firstname "")
        (decode.maybe.string .firstname2)
        (decode.maybe.string .firstname3)
        (decode.generic .gender genderFromString Undisclosed)
        (decode.string .highestDegree "")
        (decode.string .lastname "")
        (decode.string .vulnerabilityIndicator "")


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
