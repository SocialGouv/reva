module Api.Auth exposing (makeMutation, makeQuery)

import Api.Token exposing (Token)
import Graphql.Http
import Graphql.Operation
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode
import RemoteData exposing (RemoteData)


makeQuery :
    String
    -> Token
    -> (RemoteData String decodesTo -> msg)
    -> SelectionSet decodesTo Graphql.Operation.RootQuery
    -> Cmd msg
makeQuery endpointGraphql token msg query =
    query
        |> Graphql.Http.queryRequest endpointGraphql
        |> makeAuthRequest token msg


makeMutation :
    String
    -> Token
    -> (RemoteData String decodesTo -> msg)
    -> SelectionSet decodesTo Graphql.Operation.RootMutation
    -> Cmd msg
makeMutation endpointGraphql token msg query =
    query
        |> Graphql.Http.mutationRequest endpointGraphql
        |> makeAuthRequest token msg


toRemote : Result (List String) a -> RemoteData String a
toRemote r =
    Result.mapError (String.join "\n") r
        |> RemoteData.fromResult


makeAuthRequest token msg request =
    request
        |> Graphql.Http.withHeader "authorization" ("Bearer " ++ Api.Token.toString token)
        |> Graphql.Http.send (Result.mapError graphqlHttpErrorToString >> toRemote >> msg)


simpleGraphqlHttpErrorToString : Graphql.Http.HttpError -> String
simpleGraphqlHttpErrorToString httpError =
    let
        messageDecoder =
            Json.Decode.field "message" Json.Decode.string

        errorsDecoder =
            Json.Decode.field "errors" (Json.Decode.list messageDecoder)

        defaultErrorMsg code =
            String.concat
                [ "Une erreur inattendue s'est produite (code "
                , code
                , ")"
                ]
    in
    case httpError of
        Graphql.Http.BadUrl url ->
            defaultErrorMsg "021"

        Graphql.Http.Timeout ->
            defaultErrorMsg "042"

        Graphql.Http.NetworkError ->
            "Veuillez vérifier votre connexion internet puis réessayer."

        Graphql.Http.BadStatus metadata body ->
            case Json.Decode.decodeString errorsDecoder body of
                Ok message ->
                    String.join " " message

                Err _ ->
                    defaultErrorMsg <| String.fromInt metadata.statusCode

        Graphql.Http.BadPayload _ ->
            defaultErrorMsg "084"


graphqlHttpErrorToString : Graphql.Http.Error a -> List String
graphqlHttpErrorToString error =
    case error of
        Graphql.Http.HttpError httpError ->
            [ simpleGraphqlHttpErrorToString httpError ]

        Graphql.Http.GraphqlError _ errors ->
            List.map
                (\err -> err.message)
                errors
