-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Query exposing (..)

import Admin.Enum.AccountGroup
import Admin.Enum.CandidacyStatusFilter
import Admin.Enum.FeasibilityDecisionFilter
import Admin.Enum.SubscriptionRequestStatus
import Admin.InputObject
import Admin.Interface
import Admin.Object
import Admin.Scalar
import Admin.Union
import Data.Scalar
import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode as Encode exposing (Value)
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode exposing (Decoder)


type alias AccountGetAccountsOptionalArguments =
    { offset : OptionalArgument Int
    , limit : OptionalArgument Int
    , groupFilter : OptionalArgument Admin.Enum.AccountGroup.AccountGroup
    , searchFilter : OptionalArgument String
    }


account_getAccounts :
    (AccountGetAccountsOptionalArguments -> AccountGetAccountsOptionalArguments)
    -> SelectionSet decodesTo Admin.Object.AccountsPaginated
    -> SelectionSet decodesTo RootQuery
account_getAccounts fillInOptionals____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { offset = Absent, limit = Absent, groupFilter = Absent, searchFilter = Absent }

        optionalArgs____ =
            [ Argument.optional "offset" filledInOptionals____.offset Encode.int, Argument.optional "limit" filledInOptionals____.limit Encode.int, Argument.optional "groupFilter" filledInOptionals____.groupFilter (Encode.enum Admin.Enum.AccountGroup.toString), Argument.optional "searchFilter" filledInOptionals____.searchFilter Encode.string ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "account_getAccounts" optionalArgs____ object____ Basics.identity


type alias AccountGetAccountRequiredArguments =
    { id : Data.Scalar.Id }


account_getAccount :
    AccountGetAccountRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Account
    -> SelectionSet (Maybe decodesTo) RootQuery
account_getAccount requiredArgs____ object____ =
    Object.selectionForCompositeField "account_getAccount" [ Argument.required "id" requiredArgs____.id (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)


type alias GetCandidacyRequiredArguments =
    { deviceId : Data.Scalar.Id }


getCandidacy :
    GetCandidacyRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Candidacy
    -> SelectionSet (Maybe decodesTo) RootQuery
getCandidacy requiredArgs____ object____ =
    Object.selectionForCompositeField "getCandidacy" [ Argument.required "deviceId" requiredArgs____.deviceId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)


type alias GetCandidacyByIdRequiredArguments =
    { id : Data.Scalar.Id }


getCandidacyById :
    GetCandidacyByIdRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Candidacy
    -> SelectionSet (Maybe decodesTo) RootQuery
getCandidacyById requiredArgs____ object____ =
    Object.selectionForCompositeField "getCandidacyById" [ Argument.required "id" requiredArgs____.id (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)


type alias GetCandidaciesOptionalArguments =
    { offset : OptionalArgument Int
    , limit : OptionalArgument Int
    , statusFilter : OptionalArgument Admin.Enum.CandidacyStatusFilter.CandidacyStatusFilter
    , searchFilter : OptionalArgument String
    }


getCandidacies :
    (GetCandidaciesOptionalArguments -> GetCandidaciesOptionalArguments)
    -> SelectionSet decodesTo Admin.Object.CandidacySummaryPage
    -> SelectionSet decodesTo RootQuery
getCandidacies fillInOptionals____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { offset = Absent, limit = Absent, statusFilter = Absent, searchFilter = Absent }

        optionalArgs____ =
            [ Argument.optional "offset" filledInOptionals____.offset Encode.int, Argument.optional "limit" filledInOptionals____.limit Encode.int, Argument.optional "statusFilter" filledInOptionals____.statusFilter (Encode.enum Admin.Enum.CandidacyStatusFilter.toString), Argument.optional "searchFilter" filledInOptionals____.searchFilter Encode.string ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "getCandidacies" optionalArgs____ object____ Basics.identity


getTrainings :
    SelectionSet decodesTo Admin.Object.Training
    -> SelectionSet (List decodesTo) RootQuery
getTrainings object____ =
    Object.selectionForCompositeField "getTrainings" [] object____ (Basics.identity >> Decode.list)


type alias GetOrganismsForCandidacyRequiredArguments =
    { candidacyId : Data.Scalar.Uuid }


getOrganismsForCandidacy :
    GetOrganismsForCandidacyRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Organism
    -> SelectionSet (List decodesTo) RootQuery
getOrganismsForCandidacy requiredArgs____ object____ =
    Object.selectionForCompositeField "getOrganismsForCandidacy" [ Argument.required "candidacyId" requiredArgs____.candidacyId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecUuid) ] object____ (Basics.identity >> Decode.list)


type alias GetRandomOrganismsForCandidacyOptionalArguments =
    { searchText : OptionalArgument String }


type alias GetRandomOrganismsForCandidacyRequiredArguments =
    { candidacyId : Data.Scalar.Uuid }


getRandomOrganismsForCandidacy :
    (GetRandomOrganismsForCandidacyOptionalArguments -> GetRandomOrganismsForCandidacyOptionalArguments)
    -> GetRandomOrganismsForCandidacyRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Organism
    -> SelectionSet (List decodesTo) RootQuery
getRandomOrganismsForCandidacy fillInOptionals____ requiredArgs____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { searchText = Absent }

        optionalArgs____ =
            [ Argument.optional "searchText" filledInOptionals____.searchText Encode.string ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "getRandomOrganismsForCandidacy" (optionalArgs____ ++ [ Argument.required "candidacyId" requiredArgs____.candidacyId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecUuid) ]) object____ (Basics.identity >> Decode.list)


type alias GetCompanionsForCandidacyRequiredArguments =
    { candidacyId : Data.Scalar.Uuid }


getCompanionsForCandidacy :
    GetCompanionsForCandidacyRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Organism
    -> SelectionSet (List decodesTo) RootQuery
getCompanionsForCandidacy requiredArgs____ object____ =
    Object.selectionForCompositeField "getCompanionsForCandidacy" [ Argument.required "candidacyId" requiredArgs____.candidacyId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecUuid) ] object____ (Basics.identity >> Decode.list)


getBasicSkills :
    SelectionSet decodesTo Admin.Object.BasicSkill
    -> SelectionSet (List decodesTo) RootQuery
getBasicSkills object____ =
    Object.selectionForCompositeField "getBasicSkills" [] object____ (Basics.identity >> Decode.list)


candidacy_candidacyCountByStatus :
    SelectionSet decodesTo Admin.Object.CandidacyCountByStatus
    -> SelectionSet decodesTo RootQuery
candidacy_candidacyCountByStatus object____ =
    Object.selectionForCompositeField "candidacy_candidacyCountByStatus" [] object____ Basics.identity


candidate_getCandidateWithCandidacy :
    SelectionSet decodesTo Admin.Object.Candidate
    -> SelectionSet decodesTo RootQuery
candidate_getCandidateWithCandidacy object____ =
    Object.selectionForCompositeField "candidate_getCandidateWithCandidacy" [] object____ Basics.identity


type alias CandidateGetCandidateByEmailRequiredArguments =
    { email : String }


candidate_getCandidateByEmail :
    CandidateGetCandidateByEmailRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Candidate
    -> SelectionSet (Maybe decodesTo) RootQuery
candidate_getCandidateByEmail requiredArgs____ object____ =
    Object.selectionForCompositeField "candidate_getCandidateByEmail" [ Argument.required "email" requiredArgs____.email Encode.string ] object____ (Basics.identity >> Decode.nullable)


type alias CertificationAuthorityGetCertificationAuthorityRequiredArguments =
    { id : Data.Scalar.Id }


certification_authority_getCertificationAuthority :
    CertificationAuthorityGetCertificationAuthorityRequiredArguments
    -> SelectionSet decodesTo Admin.Object.CertificationAuthority
    -> SelectionSet (Maybe decodesTo) RootQuery
certification_authority_getCertificationAuthority requiredArgs____ object____ =
    Object.selectionForCompositeField "certification_authority_getCertificationAuthority" [ Argument.required "id" requiredArgs____.id (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)


feasibilityCountByCategory :
    SelectionSet decodesTo Admin.Object.FeasibilityCountByCategory
    -> SelectionSet decodesTo RootQuery
feasibilityCountByCategory object____ =
    Object.selectionForCompositeField "feasibilityCountByCategory" [] object____ Basics.identity


type alias FeasibilitiesOptionalArguments =
    { offset : OptionalArgument Int
    , limit : OptionalArgument Int
    , decision : OptionalArgument Admin.Enum.FeasibilityDecisionFilter.FeasibilityDecisionFilter
    , searchFilter : OptionalArgument String
    }


feasibilities :
    (FeasibilitiesOptionalArguments -> FeasibilitiesOptionalArguments)
    -> SelectionSet decodesTo Admin.Object.FeasibilityPage
    -> SelectionSet decodesTo RootQuery
feasibilities fillInOptionals____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { offset = Absent, limit = Absent, decision = Absent, searchFilter = Absent }

        optionalArgs____ =
            [ Argument.optional "offset" filledInOptionals____.offset Encode.int, Argument.optional "limit" filledInOptionals____.limit Encode.int, Argument.optional "decision" filledInOptionals____.decision (Encode.enum Admin.Enum.FeasibilityDecisionFilter.toString), Argument.optional "searchFilter" filledInOptionals____.searchFilter Encode.string ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "feasibilities" optionalArgs____ object____ Basics.identity


type alias FeasibilityRequiredArguments =
    { feasibilityId : Data.Scalar.Id }


feasibility :
    FeasibilityRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Feasibility
    -> SelectionSet (Maybe decodesTo) RootQuery
feasibility requiredArgs____ object____ =
    Object.selectionForCompositeField "feasibility" [ Argument.required "feasibilityId" requiredArgs____.feasibilityId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)


type alias CandidacyGetFundingRequestUnifvaeRequiredArguments =
    { candidacyId : Data.Scalar.Uuid }


candidacy_getFundingRequestUnifvae :
    CandidacyGetFundingRequestUnifvaeRequiredArguments
    -> SelectionSet decodesTo Admin.Object.FundingRequestUnifvae
    -> SelectionSet (Maybe decodesTo) RootQuery
candidacy_getFundingRequestUnifvae requiredArgs____ object____ =
    Object.selectionForCompositeField "candidacy_getFundingRequestUnifvae" [ Argument.required "candidacyId" requiredArgs____.candidacyId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecUuid) ] object____ (Basics.identity >> Decode.nullable)


type alias CandidateGetFundingRequestRequiredArguments =
    { candidacyId : Data.Scalar.Uuid }


candidate_getFundingRequest :
    CandidateGetFundingRequestRequiredArguments
    -> SelectionSet decodesTo Admin.Object.FundingRequestInformations
    -> SelectionSet decodesTo RootQuery
candidate_getFundingRequest requiredArgs____ object____ =
    Object.selectionForCompositeField "candidate_getFundingRequest" [ Argument.required "candidacyId" requiredArgs____.candidacyId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecUuid) ] object____ Basics.identity


type alias OrganismGetOrganismRequiredArguments =
    { id : Data.Scalar.Id }


organism_getOrganism :
    OrganismGetOrganismRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Organism
    -> SelectionSet (Maybe decodesTo) RootQuery
organism_getOrganism requiredArgs____ object____ =
    Object.selectionForCompositeField "organism_getOrganism" [ Argument.required "id" requiredArgs____.id (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)


getReferential :
    SelectionSet decodesTo Admin.Object.Referential
    -> SelectionSet decodesTo RootQuery
getReferential object____ =
    Object.selectionForCompositeField "getReferential" [] object____ Basics.identity


type alias GetCertificationsOptionalArguments =
    { offset : OptionalArgument Int
    , limit : OptionalArgument Int
    , departmentId : OptionalArgument Data.Scalar.Uuid
    , searchText : OptionalArgument String
    }


getCertifications :
    (GetCertificationsOptionalArguments -> GetCertificationsOptionalArguments)
    -> SelectionSet decodesTo Admin.Object.CertificationPage
    -> SelectionSet decodesTo RootQuery
getCertifications fillInOptionals____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { offset = Absent, limit = Absent, departmentId = Absent, searchText = Absent }

        optionalArgs____ =
            [ Argument.optional "offset" filledInOptionals____.offset Encode.int, Argument.optional "limit" filledInOptionals____.limit Encode.int, Argument.optional "departmentId" filledInOptionals____.departmentId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecUuid), Argument.optional "searchText" filledInOptionals____.searchText Encode.string ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "getCertifications" optionalArgs____ object____ Basics.identity


type alias GetCertificationRequiredArguments =
    { certificationId : Data.Scalar.Id }


getCertification :
    GetCertificationRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Certification
    -> SelectionSet decodesTo RootQuery
getCertification requiredArgs____ object____ =
    Object.selectionForCompositeField "getCertification" [ Argument.required "certificationId" requiredArgs____.certificationId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ Basics.identity


getRegions :
    SelectionSet decodesTo Admin.Object.Region
    -> SelectionSet (List decodesTo) RootQuery
getRegions object____ =
    Object.selectionForCompositeField "getRegions" [] object____ (Basics.identity >> Decode.list)


getDepartments :
    SelectionSet decodesTo Admin.Object.Department
    -> SelectionSet (List decodesTo) RootQuery
getDepartments object____ =
    Object.selectionForCompositeField "getDepartments" [] object____ (Basics.identity >> Decode.list)


getDegrees :
    SelectionSet decodesTo Admin.Object.Degree
    -> SelectionSet (List decodesTo) RootQuery
getDegrees object____ =
    Object.selectionForCompositeField "getDegrees" [] object____ (Basics.identity >> Decode.list)


getVulnerabilityIndicators :
    SelectionSet decodesTo Admin.Object.VulnerabilityIndicator
    -> SelectionSet (List decodesTo) RootQuery
getVulnerabilityIndicators object____ =
    Object.selectionForCompositeField "getVulnerabilityIndicators" [] object____ (Basics.identity >> Decode.list)


getDropOutReasons :
    SelectionSet decodesTo Admin.Object.DropOutReason
    -> SelectionSet (List decodesTo) RootQuery
getDropOutReasons object____ =
    Object.selectionForCompositeField "getDropOutReasons" [] object____ (Basics.identity >> Decode.list)


getReorientationReasons :
    SelectionSet decodesTo Admin.Object.ReorientationReason
    -> SelectionSet (List decodesTo) RootQuery
getReorientationReasons object____ =
    Object.selectionForCompositeField "getReorientationReasons" [] object____ (Basics.identity >> Decode.list)


getDomaines :
    SelectionSet decodesTo Admin.Object.Domaine
    -> SelectionSet (List (Maybe decodesTo)) RootQuery
getDomaines object____ =
    Object.selectionForCompositeField "getDomaines" [] object____ (Basics.identity >> Decode.nullable >> Decode.list)


getConventionCollectives :
    SelectionSet decodesTo Admin.Object.ConventionCollective
    -> SelectionSet (List (Maybe decodesTo)) RootQuery
getConventionCollectives object____ =
    Object.selectionForCompositeField "getConventionCollectives" [] object____ (Basics.identity >> Decode.nullable >> Decode.list)


type alias SubscriptionGetSubscriptionRequestsOptionalArguments =
    { offset : OptionalArgument Int
    , limit : OptionalArgument Int
    , orderBy : OptionalArgument Admin.InputObject.SubscriptionRequestOrderByInput
    , status : OptionalArgument Admin.Enum.SubscriptionRequestStatus.SubscriptionRequestStatus
    }


subscription_getSubscriptionRequests :
    (SubscriptionGetSubscriptionRequestsOptionalArguments -> SubscriptionGetSubscriptionRequestsOptionalArguments)
    -> SelectionSet decodesTo Admin.Object.SubscriptionRequestsPaginated
    -> SelectionSet decodesTo RootQuery
subscription_getSubscriptionRequests fillInOptionals____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { offset = Absent, limit = Absent, orderBy = Absent, status = Absent }

        optionalArgs____ =
            [ Argument.optional "offset" filledInOptionals____.offset Encode.int, Argument.optional "limit" filledInOptionals____.limit Encode.int, Argument.optional "orderBy" filledInOptionals____.orderBy Admin.InputObject.encodeSubscriptionRequestOrderByInput, Argument.optional "status" filledInOptionals____.status (Encode.enum Admin.Enum.SubscriptionRequestStatus.toString) ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "subscription_getSubscriptionRequests" optionalArgs____ object____ Basics.identity


type alias SubscriptionGetSubscriptionRequestRequiredArguments =
    { subscriptionRequestId : Data.Scalar.Id }


subscription_getSubscriptionRequest :
    SubscriptionGetSubscriptionRequestRequiredArguments
    -> SelectionSet decodesTo Admin.Object.SubscriptionRequest
    -> SelectionSet (Maybe decodesTo) RootQuery
subscription_getSubscriptionRequest requiredArgs____ object____ =
    Object.selectionForCompositeField "subscription_getSubscriptionRequest" [ Argument.required "subscriptionRequestId" requiredArgs____.subscriptionRequestId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)

activeFeaturesForConnectedUser : SelectionSet (List String) RootQuery
activeFeaturesForConnectedUser =
    Object.selectionForField "(List String)" "activeFeaturesForConnectedUser" [] (Decode.string |> Decode.list)
