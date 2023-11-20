module Api.Certification exposing (getCertifications, selection, summarySelection)

import Admin.Object
import Admin.Object.Certification
import Admin.Object.CertificationPage
import Admin.Object.CertificationSummary
import Admin.Query as Query
import Api.Auth as Auth
import Api.Pagination exposing (pageInfoSelection)
import Api.Token exposing (Token)
import Data.Certification
import Graphql.OptionalArgument as OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


getCertifications :
    String
    -> Token
    -> Int
    -> (RemoteData (List String) Data.Certification.CertificationPage -> msg)
    -> Maybe String
    -> Cmd msg
getCertifications endpointGraphql token page toMsg searchText =
    Query.getCertifications
        (\optionals ->
            { optionals
                | limit = Present 10
                , offset = Present ((page - 1) * 10)
                , searchText = OptionalArgument.fromMaybe searchText
            }
        )
        pageSelection
        |> Auth.makeQuery "getCertifications" endpointGraphql token toMsg


pageSelection : SelectionSet Data.Certification.CertificationPage Admin.Object.CertificationPage
pageSelection =
    SelectionSet.succeed Data.Certification.CertificationPage
        |> with (Admin.Object.CertificationPage.rows selection)
        |> with (Admin.Object.CertificationPage.info pageInfoSelection)


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
