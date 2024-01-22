module Api.DossierDeValidation exposing (selection)

import Admin.Object
import Admin.Object.DossierDeValidation
import Admin.Scalar exposing (Uuid(..))
import Api.File as File
import Data.DossierDeValidation
import File
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)


selection : SelectionSet Data.DossierDeValidation.DossierDeValidation Admin.Object.DossierDeValidation
selection =
    SelectionSet.succeed Data.DossierDeValidation.DossierDeValidation
        |> with Admin.Object.DossierDeValidation.id
        |> with Admin.Object.DossierDeValidation.dossierDeValidationSentAt
        |> with (Admin.Object.DossierDeValidation.dossierDeValidationFile File.selection)
