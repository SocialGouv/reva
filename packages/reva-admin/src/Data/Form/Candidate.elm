module Data.Form.Candidate exposing (candidate, fromDict, keys)

import Admin.Enum.Gender exposing (Gender(..))
import Data.Candidate exposing (genderFromString, genderToString)
import Data.Form.Helper as Helper
import Dict exposing (Dict)


type alias CandidateInput =
    { firstname : String
    , firstname2 : Maybe String
    , firstname3 : Maybe String
    , gender : Gender
    , highestDegreeId : String
    , lastname : String
    , vulnerabilityIndicatorId : String
    }


keys :
    { firstname : String
    , firstname2 : String
    , firstname3 : String
    , gender : String
    , highestDegree : String
    , lastname : String
    , vulnerabilityIndicator : String
    }
keys =
    { firstname = "firstname"
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
        (decode.string .firstname "")
        (decode.maybe.string .firstname2)
        (decode.maybe.string .firstname3)
        (decode.generic .gender genderFromString Undisclosed)
        (decode.string .highestDegree "")
        (decode.string .lastname "")
        (decode.string .vulnerabilityIndicator "")


candidate :
    String
    -> Maybe String
    -> Maybe String
    -> Maybe Gender
    -> Maybe String
    -> String
    -> Maybe String
    -> Dict String String
candidate firstname firstname2 firstname3 gender highestDegreeId lastname vulnerabilityIndicatorId =
    [ ( .firstname, Just firstname )
    , ( .firstname2, firstname2 )
    , ( .firstname3, firstname3 )
    , ( .gender, Maybe.map genderToString gender )
    , ( .highestDegree, highestDegreeId )
    , ( .lastname, Just lastname )
    , ( .vulnerabilityIndicator, vulnerabilityIndicatorId )
    ]
        |> Helper.toDict keys
