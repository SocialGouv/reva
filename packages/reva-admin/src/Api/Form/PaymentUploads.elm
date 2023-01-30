module Api.Form.PaymentUploads exposing (submit)

import Api.Token exposing (Token)
import Data.Candidacy exposing (Candidacy, CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.PaymentRequest
import Data.Referential
import Http
import RemoteData exposing (RemoteData(..))


submit :
    CandidacyId
    -> String
    -> String
    -> Token
    -> (RemoteData String () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
submit candidacyId uploadEndpoint _ token toMsg ( candidacy, referential ) formData =
    let
        keys =
            Data.Form.PaymentRequest.keys

        invoiceFiles =
            Data.Form.getFiles keys.invoiceFiles formData
                |> List.map (\( _, file ) -> ( "invoice", file ))

        appointmentFiles =
            Data.Form.getFiles keys.appointmentFiles formData
                |> List.map (\( _, file ) -> ( "appointment", file ))

        withFiles files body =
            files
                |> List.map (\( name, file ) -> Http.filePart name file)
                |> (++) body

        post files =
            Http.request
                { method = "POST"
                , headers = [ Http.header "authorization" ("Bearer " ++ Api.Token.toString token) ]
                , url = uploadEndpoint
                , body =
                    [ Http.stringPart "candidacyId" (Data.Candidacy.candidacyIdToString candidacyId) ]
                        |> withFiles files
                        |> Http.multipartBody
                , expect = Http.expectString (stringErrorResponse >> RemoteData.fromResult >> toMsg)
                , timeout = Nothing
                , tracker = Nothing
                }
    in
    case ( invoiceFiles, appointmentFiles ) of
        ( [ invoiceFile ], [ appointmentFile ] ) ->
            post [ invoiceFile, appointmentFile ]

        ( [ invoiceFile ], [] ) ->
            post [ invoiceFile ]

        ( [], [ appointmentFile ] ) ->
            post [ appointmentFile ]

        ( _, _ ) ->
            Cmd.none


stringErrorResponse : Result Http.Error value -> Result String ()
stringErrorResponse result =
    let
        httpErrorToString error =
            case error of
                Http.BadUrl url ->
                    "BadUrl: " ++ url

                Http.Timeout ->
                    "Timeout"

                Http.NetworkError ->
                    "NetworkError"

                Http.BadStatus code ->
                    "BadStatus: " ++ String.fromInt code

                Http.BadBody bodyError ->
                    "BadBody: " ++ bodyError
    in
    case result of
        Ok _ ->
            Ok ()

        Err err ->
            Err (httpErrorToString err)
