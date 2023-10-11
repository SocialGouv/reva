module Api.Form.Organism exposing (get, update)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Organism
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Form exposing (FormData)
import Data.Form.Organism
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
get organismId endpointGraphql token toMsg =
    let
        requiredArgs =
            Query.OrganismGetOrganismRequiredArguments (Id organismId)
    in
    Query.organism_getOrganism
        requiredArgs
        selection
        |> Auth.makeQuery "getOrganism" endpointGraphql token (nothingToError "Cette organisme est introuvable" >> toMsg)


update :
    String
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ()
    -> FormData
    -> Cmd msg
update organismId endpointGraphql token toMsg _ formData =
    let
        organism =
            Data.Form.Organism.organismFromDict organismId formData

        organismData =
            Admin.InputObject.UpdateOrganismInput
                organism.contactAdministrativeEmail
                (Present organism.contactAdministrativePhone)
                (Present organism.website)

        organismRequiredArs =
            Mutation.OrganismUpdateOrganismRequiredArguments
                (Id <| organismId)
                organismData
    in
    Mutation.organism_updateOrganism organismRequiredArs SelectionSet.empty
        |> Auth.makeMutation "updateOrganism" endpointGraphql token toMsg


selection : SelectionSet (Dict String String) Admin.Object.Organism
selection =
    SelectionSet.succeed Data.Form.Organism.organism
        |> with Admin.Object.Organism.contactAdministrativeEmail
        |> with Admin.Object.Organism.contactAdministrativePhone
        |> with Admin.Object.Organism.website
