module Api exposing (Token, createSkill, fetchCandidates, fetchSkills, login, stringToToken, tokenToString)

import Candidate exposing (Candidate)
import Candidate.MetaSkill exposing (MetaSkill)
import Http
import Json.Decode as Decode
import Json.Encode as Encode
import RemoteData exposing (WebData)


type Token
    = Token String


tokenToString : Token -> String
tokenToString (Token token) =
    token


stringToToken : String -> Token
stringToToken token =
    Token token


login : (Result Http.Error Token -> msg) -> { a | email : String, password : String } -> Cmd msg
login msg payload =
    Http.post
        { url = "/api/auth/login"
        , body = Http.jsonBody (Encode.object [ ( "email", Encode.string payload.email ), ( "password", Encode.string payload.password ) ])
        , expect =
            Http.expectJson msg
                (Decode.at [ "token" ] Decode.string
                    |> Decode.andThen (\token -> Decode.succeed (Token token))
                )
        }


fetchCandidates : (Result Http.Error (List Candidate) -> msg) -> { a | token : Token } -> Cmd msg
fetchCandidates msg payload =
    Http.request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ tokenToString payload.token)
            ]
        , url = "/api/candidates"
        , body = Http.emptyBody
        , expect = Http.expectJson msg (Decode.list Candidate.decoder)
        , timeout = Nothing
        , tracker = Nothing
        }



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
