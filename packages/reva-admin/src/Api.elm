module Api exposing (Token, anonymous, createSkill, deleteSkill, fetchSkills, initToken, tokenToString)

import Candidate.MetaSkill exposing (MetaSkill)
import Data.Candidate as Candidate exposing (Candidate)
import Http
import RemoteData exposing (WebData)


type Token
    = Token String


tokenToString : Token -> String
tokenToString (Token token) =
    token


stringToToken : String -> Token
stringToToken token =
    Token token


anonymous : Token
anonymous =
    Token "anonymous"



-- SKILLS


createSkill : (WebData MetaSkill -> msg) -> { a | candicadyId : String, skill : MetaSkill, token : Token } -> Cmd msg
createSkill msg payload =
    Http.request
        { method = "POST"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ tokenToString payload.token)
            ]
        , url = "/api/candidacies/" ++ payload.candicadyId ++ "/skills"
        , body = Http.jsonBody <| Candidate.encodeMetaSkill payload.skill
        , expect =
            Http.expectJson (RemoteData.fromResult >> msg) Candidate.metaSkillDecoder
        , timeout = Nothing
        , tracker = Nothing
        }


deleteSkill : (WebData MetaSkill -> msg) -> { a | candicadyId : String, skill : MetaSkill, token : Token } -> Cmd msg
deleteSkill msg payload =
    Http.request
        { method = "DELETE"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ tokenToString payload.token)
            ]
        , url = "/api/candidacies/" ++ payload.candicadyId ++ "/skills/" ++ payload.skill.id
        , body = Http.emptyBody
        , expect =
            Http.expectWhatever (RemoteData.fromResult >> RemoteData.map (\_ -> payload.skill) >> msg)
        , timeout = Nothing
        , tracker = Nothing
        }


fetchSkills : (WebData (List MetaSkill) -> msg) -> { a | candicadyId : String, token : Token } -> Cmd msg
fetchSkills msg payload =
    Http.request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ tokenToString payload.token)
            ]
        , url = "/api/candidacies/" ++ payload.candicadyId ++ "/skills"
        , body = Http.emptyBody
        , expect = Http.expectJson (RemoteData.fromResult >> msg) Candidate.metaSkillsDecoder
        , timeout = Nothing
        , tracker = Nothing
        }
