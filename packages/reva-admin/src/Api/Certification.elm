module Api.Certification exposing (searchCertificationsForCandidate, selection, summarySelection)

import Admin.Enum.CertificationStatus
import Admin.Object
import Admin.Object.Certification
import Admin.Object.CertificationPage
import Admin.Object.CertificationSummary
import Admin.Query as Query
import Admin.Scalar exposing (Uuid(..))
import Api.Auth as Auth
import Api.Pagination exposing (pageInfoSelection)
import Api.Token exposing (Token)
import Data.Certification
import Graphql.OptionalArgument as OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


searchCertificationsForCandidate :
    String
    -> Token
    -> Int
    -> Maybe String
    -> (RemoteData (List String) Data.Certification.CertificationPage -> msg)
    -> Maybe String
    -> Cmd msg
searchCertificationsForCandidate endpointGraphql token page organismId toMsg searchText =
    Query.searchCertificationsForCandidate
        (\optionals ->
            { optionals
                | limit = Present 10
                , offset = Present ((page - 1) * 10)
                , searchText = OptionalArgument.fromMaybe searchText
                , organismId = OptionalArgument.fromMaybe (Maybe.map Uuid organismId)
                , status = Present Admin.Enum.CertificationStatus.Available
            }
        )
        pageSelection
        |> Auth.makeQuery "searchCertificationsForCandidate" endpointGraphql token toMsg


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
