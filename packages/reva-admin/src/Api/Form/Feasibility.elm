module Api.Form.Feasibility exposing (..)
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Token exposing (Token)
import Data.Candidacy exposing ( CandidacyId)
import Data.Form exposing (FormData)
import Data.Referential
import RemoteData exposing (RemoteData(..))
import Data.Form.Feasibility
import Http
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
            Data.Form.Feasibility.keys

        feasibilityFiles =
            Data.Form.getFiles keys.feasibilityFile formData
                |> List.map (\( _, file ) -> ( keys.feasibilityFile, file ))

        otherFiles =
            Data.Form.getFiles keys.otherFile formData
                |> List.map (\( _, file ) -> (keys.otherFile, file ))

        withFiles files body =
            files
                |> List.map (\( name, file ) -> Http.filePart name file)
                |> (++) body

        post files =
            Http.request
                { method = "POST"
                , headers = [ Http.header "authorization" ("Bearer " ++ Api.Token.toString token) ]
                , url = restApiEndpoint ++ "/feasibility/upload-feasibility-file"
                , body =
                    [ Http.stringPart "candidacyId" (Data.Candidacy.candidacyIdToString candidacyId) ]
                        |> withFiles files
                        |> Http.multipartBody
                , expect = mayExpectError (RemoteData.fromResult >> toMsg)
                , timeout = Nothing
                , tracker = Nothing
                }

        error msg =
            Task.succeed (RemoteData.Failure [ msg ])
                |> Task.perform toMsg

    in
    case ( feasibilityFiles, otherFiles ) of

        ( [], _ ) ->
            error "Veuillez choisir un dossier de faisabilité."

        ( [ feasibilityFile ], [ otherFile ] ) ->
            post [ feasibilityFile, otherFile ]

        ( [ feasibilityFile ], _ ) ->
            post [ feasibilityFile ]


        ( _, _ ) ->
            error "Vous ne pouvez pas envoyer plus d'un dossier de faisabilité et plus d'une autre pièce jointe."

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
