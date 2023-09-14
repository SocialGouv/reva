module Api.CertificationAuthority exposing (..)

import Admin.Object
import Admin.Object.CertificationAuthority
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Data.CertificationAuthority
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)


selection : SelectionSet Data.CertificationAuthority.CertificationAuthority Admin.Object.CertificationAuthority
selection =
    SelectionSet.succeed Data.CertificationAuthority.CertificationAuthority
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.CertificationAuthority.id)
        |> with Admin.Object.CertificationAuthority.label
        |> with Admin.Object.CertificationAuthority.contactFullName
        |> with Admin.Object.CertificationAuthority.contactEmail
