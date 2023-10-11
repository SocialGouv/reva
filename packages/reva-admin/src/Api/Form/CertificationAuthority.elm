module Api.Form.CertificationAuthority exposing (get, update)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.CertificationAuthority
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Form exposing (FormData)
import Data.Form.CertificationAuthority
import Dict exposing (Dict)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


get :
    String
    -> String
    -> Token
    -> (RemoteData (List String) (Dict String String) -> msg)
    -> Cmd msg
get certificationAuthorityId endpointGraphql token toMsg =
    let
        requiredArgs =
            Query.CertificationAuthorityGetCertificationAuthorityRequiredArguments (Id certificationAuthorityId)
    in
    Query.certification_authority_getCertificationAuthority
        requiredArgs
        selection
        |> Auth.makeQuery "getCertificationAuthority" endpointGraphql token (nothingToError "Cette autorité de certification est introuvable" >> toMsg)


update :
    String
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ()
    -> FormData
    -> Cmd msg
update certificationAuthorityId endpointGraphql token toMsg _ formData =
    let
        certificationAuthority =
            Data.Form.CertificationAuthority.certificationAuthorityFromDict certificationAuthorityId formData

        certificationAuthorityData =
            Admin.InputObject.UpdateCertificationAuthorityInput
                certificationAuthority.label
                (Present certificationAuthority.contactFullName)
                (Present certificationAuthority.contactEmail)

        certificationAuthorityRequiredArs =
            Mutation.CertificationAuthorityUpdateCertificationAuthorityRequiredArguments
                (Id <| certificationAuthorityId)
                certificationAuthorityData
    in
    Mutation.certification_authority_updateCertificationAuthority certificationAuthorityRequiredArs SelectionSet.empty
        |> Auth.makeMutation "updateCertificationAuthority" endpointGraphql token toMsg


selection : SelectionSet (Dict String String) Admin.Object.CertificationAuthority
selection =
    SelectionSet.succeed Data.Form.CertificationAuthority.certificationAuthority
        |> with Admin.Object.CertificationAuthority.label
        |> with Admin.Object.CertificationAuthority.contactFullName
        |> with Admin.Object.CertificationAuthority.contactEmail
