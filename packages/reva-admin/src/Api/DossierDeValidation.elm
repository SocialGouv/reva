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
        |> with Admin.Object.DossierDeValidation.decision
        |> with Admin.Object.DossierDeValidation.decisionSentAt
        |> with Admin.Object.DossierDeValidation.decisionComment
        |> with (Admin.Object.DossierDeValidation.dossierDeValidationFile File.selection)
        |> with (Admin.Object.DossierDeValidation.dossierDeValidationOtherFiles File.selection)
        |> with (Admin.Object.DossierDeValidation.history historySelection)


historySelection : SelectionSet Data.DossierDeValidation.DossierDeValidationHistory Admin.Object.DossierDeValidation
historySelection =
    SelectionSet.succeed Data.DossierDeValidation.DossierDeValidationHistory
        |> with Admin.Object.DossierDeValidation.id
        |> with Admin.Object.DossierDeValidation.decisionSentAt
        |> with Admin.Object.DossierDeValidation.decisionComment
