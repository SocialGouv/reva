module Api.Certification exposing (selection, summarySelection)

import Admin.Object
import Admin.Object.Certification
import Admin.Object.CertificationSummary
import Data.Certification
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)


selection : SelectionSet Data.Certification.Certification Admin.Object.Certification
selection =
    SelectionSet.succeed Data.Certification.Certification
        |> with Admin.Object.Certification.id
        |> with Admin.Object.Certification.codeRncp
        |> with Admin.Object.Certification.label


summarySelection : SelectionSet Data.Certification.CertificationSummary Admin.Object.CertificationSummary
summarySelection =
    SelectionSet.succeed Data.Certification.CertificationSummary
        |> with Admin.Object.CertificationSummary.id
        |> with Admin.Object.CertificationSummary.label
