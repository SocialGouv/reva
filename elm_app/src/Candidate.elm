module Candidate exposing (Candidate, City, Diplome, StatusEvent, SurveyEvent, decoder, encodeMetaSkill, isRejected, maybeCityToString, maybeDiplomeToString, metaSkillDecoder, metaSkillsDecoder)

import Candidate.Grade as Grade exposing (Grade)
import Candidate.MetaSkill exposing (MetaSkill)
import Candidate.Status as Status exposing (Status(..))
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (optional, required)
import Json.Encode as Encode
import RemoteData exposing (WebData)


type alias Diplome =
    { id : String
    , label : String
    }


type alias Candidate =
    { candidacyId : String
    , city : Maybe City
    , diplome : Maybe Diplome
    , email : String
    , firstname : String
    , lastname : String
    , metaSkills : WebData (List MetaSkill)
    , phoneNumber : String
    , statusHistory : List StatusEvent
    , surveys : List SurveyEvent
    }


type alias City =
    { id : String
    , label : String
    , region : String
    }


type alias Grades =
    { obtainment : Grade
    , profile : Grade
    }


type alias SurveyEvent =
    { date : String
    , grades : Grades
    , timestamp : Int
    }


type alias StatusEvent =
    { date : String
    , status : Status
    , timestamp : Int
    }


maybeDiplomeToString : Maybe Diplome -> String
maybeDiplomeToString maybeDiplome =
    maybeDiplome |> Maybe.map (\diplome -> diplome.label) |> Maybe.withDefault ""


maybeCityToString : Maybe City -> String
maybeCityToString maybeCity =
    maybeCity |> Maybe.map (\city -> city.label ++ ", " ++ city.region) |> Maybe.withDefault ""


isRejected : Candidate -> Bool
isRejected candidate =
    case List.head candidate.statusHistory |> Maybe.map .status of
        Just (RejectedBy _) ->
            True

        _ ->
            False



-- DECODER


diplomeDecoder : Decoder Diplome
diplomeDecoder =
    Decode.succeed Diplome
        |> required "id" Decode.string
        |> required "label" Decode.string


cityDecoder : Decoder City
cityDecoder =
    Decode.succeed City
        |> required "id" Decode.string
        |> required "label" Decode.string
        |> required "region" Decode.string


gradeDecoder : Decoder Grades
gradeDecoder =
    Decode.succeed Grades
        |> required "obtainment" (Decode.string |> Decode.map Grade.fromString)
        |> required "profile" (Decode.string |> Decode.map Grade.fromString)


surveyDecoder : Decoder SurveyEvent
surveyDecoder =
    Decode.succeed SurveyEvent
        |> required "date" Decode.string
        |> optional "grades" gradeDecoder { obtainment = Grade.Unknown, profile = Grade.Unknown }
        |> required "timestamp" Decode.int


statusDecoder : Decoder StatusEvent
statusDecoder =
    Decode.succeed StatusEvent
        |> required "date" Decode.string
        |> required "name" (Decode.string |> Decode.map Status.fromString)
        |> required "timestamp" Decode.int


metaSkillDecoder : Decoder MetaSkill
metaSkillDecoder =
    Decode.succeed MetaSkill
        |> required "id" Decode.string
        |> required "category" Decode.string
        |> required "label" Decode.string
        |> required "comment" Decode.string
        |> required "type" Decode.string


metaSkillsDecoder : Decoder (List MetaSkill)
metaSkillsDecoder =
    Decode.list metaSkillDecoder


decoder : Decoder Candidate
decoder =
    Decode.succeed Candidate
        |> required "candidacyId" Decode.string
        |> optional "city" (Decode.maybe cityDecoder) Nothing
        |> optional "diplome" (Decode.maybe diplomeDecoder) Nothing
        |> required "email" Decode.string
        |> required "firstname" Decode.string
        |> required "lastname" Decode.string
        |> required "metaSkill" (Decode.succeed RemoteData.NotAsked)
        |> required "phoneNumber" Decode.string
        |> required "statuses" (Decode.list statusDecoder)
        |> required "surveys" (Decode.list surveyDecoder)



-- ENCODER


encodeMetaSkill : MetaSkill -> Encode.Value
encodeMetaSkill skill =
    Encode.object
        [ ( "label", Encode.string skill.label )
        , ( "category", Encode.string skill.category )
        , ( "comment", Encode.string skill.comment )
        , ( "type", Encode.string skill.type_ )
        ]
