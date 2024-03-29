module Api.Auth exposing (makeMutation, makeQuery)

import Api.Token exposing (Token)
import Graphql.Http
import Graphql.Operation
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode
import RemoteData exposing (RemoteData)


makeQuery :
    String
    -> String
    -> Token
    -> (RemoteData (List String) decodesTo -> msg)
    -> SelectionSet decodesTo Graphql.Operation.RootQuery
    -> Cmd msg
makeQuery operationName endpointGraphql token msg query =
    query
        |> Graphql.Http.queryRequest endpointGraphql
        |> Graphql.Http.withOperationName operationName
        |> makeAuthRequest token msg


makeMutation :
    String
    -> String
    -> Token
    -> (RemoteData (List String) decodesTo -> msg)
    -> SelectionSet decodesTo Graphql.Operation.RootMutation
    -> Cmd msg
makeMutation operationName endpointGraphql token msg query =
    query
        |> Graphql.Http.mutationRequest endpointGraphql
        |> Graphql.Http.withOperationName operationName
        |> makeAuthRequest token msg


makeAuthRequest token msg request =
    request
        |> Graphql.Http.withHeader "authorization" ("Bearer " ++ Api.Token.toString token)
        |> Graphql.Http.send (Result.mapError graphqlHttpErrorToString >> RemoteData.fromResult >> msg)


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
