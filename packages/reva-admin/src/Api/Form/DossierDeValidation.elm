module Api.Form.DossierDeValidation exposing (submit)

import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.DossierDeValidation
import Data.Referential
import Http
import RemoteData exposing (RemoteData(..))
import Task


submit :
    CandidacyId
    -> String
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
submit candidacyId restApiEndpoint _ token toMsg ( _, _ ) formData =
    let
        keys =
            Data.Form.DossierDeValidation.keys

        dossierDeValidationFiles =
            Data.Form.getFiles keys.dossierDeValidationFile formData
                |> List.map (\( _, file ) -> ( keys.dossierDeValidationFile, file ))

        dossierDeValidationOtherFiles =
            List.range 1 5
                |> List.concatMap
                    (\n ->
                        Data.Form.getFiles (keys.dossierDeValidationOtherFiles ++ String.fromInt n) formData
                            |> List.map (\( _, file ) -> ( keys.dossierDeValidationOtherFiles, file ))
                    )
                |> List.filter (\_ -> True)

        withFiles files body =
            files
                |> List.map (\( name, file ) -> Http.filePart name file)
                |> (++) body

        post files =
            Http.request
                { method = "POST"
                , headers = [ Http.header "authorization" ("Bearer " ++ Api.Token.toString token) ]
                , url = restApiEndpoint ++ "/dossier-de-validation/upload-dossier-de-validation"
                , body =
                    [ Http.stringPart "candidacyId" (Data.Candidacy.candidacyIdToString candidacyId)
                    ]
                        |> withFiles files
                        |> Http.multipartBody
                , expect = mayExpectError (RemoteData.fromResult >> toMsg)
                , timeout = Nothing
                , tracker = Nothing
                }
    in
    post (List.concat [ dossierDeValidationFiles, dossierDeValidationOtherFiles ])


mayExpectError : (Result (List String) () -> msg) -> Http.Expect msg
mayExpectError toMsg =
    Http.expectStringResponse toMsg <|
        \response ->
            case response of
                Http.BadStatus_ metadata errorBody ->
                    if metadata.statusCode == 413 then
                        Err [ "Le fichier que vous tentez d'envoyer est trop volumineux. Veuillez soumettre un fichier d'une taille inférieure à 10 Mo." ]

                    else
                        Err [ errorBody ]

                Http.GoodStatus_ _ _ ->
                    Ok ()

                _ ->
                    Err [ "Une erreur est survenue" ]
