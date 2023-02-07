module Api.Form.PaymentUploads exposing (submit)

import Api.Token exposing (Token)
import Data.Candidacy exposing (Candidacy, CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.PaymentRequest
import Data.Referential
import Http
import RemoteData exposing (RemoteData(..))
import Task


submit :
    CandidacyId
    -> String
    -> String
    -> Token
    -> (RemoteData String () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
submit candidacyId uploadEndpoint _ token toMsg ( _, _ ) formData =
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
                , expect = mayExpectError (RemoteData.fromResult >> toMsg)
                , timeout = Nothing
                , tracker = Nothing
                }

        error msg =
            Task.succeed (RemoteData.Failure msg)
                |> Task.perform toMsg
    in
    case ( invoiceFiles, appointmentFiles ) of
        ( [ invoiceFile ], [ appointmentFile ] ) ->
            post [ invoiceFile, appointmentFile ]

        ( [ _ ], [] ) ->
            error "Veuillez choisir une attestation de présence."

        ( [], [ _ ] ) ->
            error "Veuillez choisir une facture."

        ( [], [] ) ->
            error "Veuillez choisir une facture et une attestation de présence."

        ( _, _ ) ->
            error "Vous ne pouvez pas envoyer plus d'une facture et plus d'une attestation de présence."


mayExpectError toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadStatus_ metadata errorBody ->
                    if metadata.statusCode == 413 then
                        Err "Le fichier que vous tentez d'envoyer est trop volumineux. Veuillez soumettre un fichier d'une taille inférieure à 10 Mo."

                    else
                        Err errorBody

                Http.GoodStatus_ _ _ ->
                    Ok ()

                _ ->
                    Err "Une erreur est survenue"
