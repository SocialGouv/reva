-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Mutation exposing (..)

import Admin.InputObject
import Admin.Interface
import Admin.Object
import Admin.Scalar
import Admin.ScalarCodecs
import Admin.Union
import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode as Encode exposing (Value)
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode exposing (Decoder)


type alias CandidacyCreateCandidacyRequiredArguments =
    { candidacy : Admin.InputObject.CandidacyInput }


candidacy_createCandidacy :
    CandidacyCreateCandidacyRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Candidacy
    -> SelectionSet (Maybe decodesTo) RootMutation
candidacy_createCandidacy requiredArgs____ object____ =
    Object.selectionForCompositeField "candidacy_createCandidacy" [ Argument.required "candidacy" requiredArgs____.candidacy Admin.InputObject.encodeCandidacyInput ] object____ (Basics.identity >> Decode.nullable)


type alias CandidacySubmitCandidacyRequiredArguments =
    { deviceId : Admin.ScalarCodecs.Id
    , candidacyId : Admin.ScalarCodecs.Id
    }


candidacy_submitCandidacy :
    CandidacySubmitCandidacyRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Candidacy
    -> SelectionSet (Maybe decodesTo) RootMutation
candidacy_submitCandidacy requiredArgs____ object____ =
    Object.selectionForCompositeField "candidacy_submitCandidacy" [ Argument.required "deviceId" requiredArgs____.deviceId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "candidacyId" requiredArgs____.candidacyId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)


type alias CandidacyUpdateCertificationRequiredArguments =
    { deviceId : Admin.ScalarCodecs.Id
    , candidacyId : Admin.ScalarCodecs.Id
    , certificationId : Admin.ScalarCodecs.Id
    }


candidacy_updateCertification :
    CandidacyUpdateCertificationRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Candidacy
    -> SelectionSet (Maybe decodesTo) RootMutation
candidacy_updateCertification requiredArgs____ object____ =
    Object.selectionForCompositeField "candidacy_updateCertification" [ Argument.required "deviceId" requiredArgs____.deviceId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "candidacyId" requiredArgs____.candidacyId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "certificationId" requiredArgs____.certificationId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] object____ (Basics.identity >> Decode.nullable)


type alias CandidacyAddExperienceOptionalArguments =
    { experience : OptionalArgument Admin.InputObject.ExperienceInput }


type alias CandidacyAddExperienceRequiredArguments =
    { deviceId : Admin.ScalarCodecs.Id
    , candidacyId : Admin.ScalarCodecs.Id
    }


candidacy_addExperience :
    (CandidacyAddExperienceOptionalArguments -> CandidacyAddExperienceOptionalArguments)
    -> CandidacyAddExperienceRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Experience
    -> SelectionSet (Maybe decodesTo) RootMutation
candidacy_addExperience fillInOptionals____ requiredArgs____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { experience = Absent }

        optionalArgs____ =
            [ Argument.optional "experience" filledInOptionals____.experience Admin.InputObject.encodeExperienceInput ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "candidacy_addExperience" (optionalArgs____ ++ [ Argument.required "deviceId" requiredArgs____.deviceId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "candidacyId" requiredArgs____.candidacyId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId) ]) object____ (Basics.identity >> Decode.nullable)


type alias CandidacyUpdateExperienceOptionalArguments =
    { experience : OptionalArgument Admin.InputObject.ExperienceInput }


type alias CandidacyUpdateExperienceRequiredArguments =
    { deviceId : Admin.ScalarCodecs.Id
    , candidacyId : Admin.ScalarCodecs.Id
    , experienceId : Admin.ScalarCodecs.Id
    }


candidacy_updateExperience :
    (CandidacyUpdateExperienceOptionalArguments -> CandidacyUpdateExperienceOptionalArguments)
    -> CandidacyUpdateExperienceRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Experience
    -> SelectionSet (Maybe decodesTo) RootMutation
candidacy_updateExperience fillInOptionals____ requiredArgs____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { experience = Absent }

        optionalArgs____ =
            [ Argument.optional "experience" filledInOptionals____.experience Admin.InputObject.encodeExperienceInput ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "candidacy_updateExperience" (optionalArgs____ ++ [ Argument.required "deviceId" requiredArgs____.deviceId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "candidacyId" requiredArgs____.candidacyId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "experienceId" requiredArgs____.experienceId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId) ]) object____ (Basics.identity >> Decode.nullable)


type alias CandidacyRemoveExperienceRequiredArguments =
    { deviceId : Admin.ScalarCodecs.Id
    , candidacyId : Admin.ScalarCodecs.Id
    , experienceId : Admin.ScalarCodecs.Id
    }


candidacy_removeExperience :
    CandidacyRemoveExperienceRequiredArguments
    -> SelectionSet (Maybe Admin.ScalarCodecs.Void) RootMutation
candidacy_removeExperience requiredArgs____ =
    Object.selectionForField "(Maybe ScalarCodecs.Void)" "candidacy_removeExperience" [ Argument.required "deviceId" requiredArgs____.deviceId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "candidacyId" requiredArgs____.candidacyId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "experienceId" requiredArgs____.experienceId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapCodecs |> .codecVoid |> .decoder |> Decode.nullable)


type alias CandidacyUpdateGoalsRequiredArguments =
    { deviceId : Admin.ScalarCodecs.Id
    , candidacyId : Admin.ScalarCodecs.Id
    , goals : List Admin.InputObject.CandidateGoalInput
    }


candidacy_updateGoals :
    CandidacyUpdateGoalsRequiredArguments
    -> SelectionSet Int RootMutation
candidacy_updateGoals requiredArgs____ =
    Object.selectionForField "Int" "candidacy_updateGoals" [ Argument.required "deviceId" requiredArgs____.deviceId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "candidacyId" requiredArgs____.candidacyId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "goals" requiredArgs____.goals (Admin.InputObject.encodeCandidateGoalInput |> Encode.list) ] Decode.int


type alias CandidacyUpdateContactOptionalArguments =
    { email : OptionalArgument String
    , phone : OptionalArgument String
    }


type alias CandidacyUpdateContactRequiredArguments =
    { deviceId : Admin.ScalarCodecs.Id
    , candidacyId : Admin.ScalarCodecs.Id
    }


candidacy_updateContact :
    (CandidacyUpdateContactOptionalArguments -> CandidacyUpdateContactOptionalArguments)
    -> CandidacyUpdateContactRequiredArguments
    -> SelectionSet decodesTo Admin.Object.Candidacy
    -> SelectionSet (Maybe decodesTo) RootMutation
candidacy_updateContact fillInOptionals____ requiredArgs____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { email = Absent, phone = Absent }

        optionalArgs____ =
            [ Argument.optional "email" filledInOptionals____.email Encode.string, Argument.optional "phone" filledInOptionals____.phone Encode.string ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "candidacy_updateContact" (optionalArgs____ ++ [ Argument.required "deviceId" requiredArgs____.deviceId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId), Argument.required "candidacyId" requiredArgs____.candidacyId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId) ]) object____ (Basics.identity >> Decode.nullable)


type alias CandidacyDeleteByIdRequiredArguments =
    { candidacyId : Admin.ScalarCodecs.Id }


candidacy_deleteById :
    CandidacyDeleteByIdRequiredArguments
    -> SelectionSet (Maybe String) RootMutation
candidacy_deleteById requiredArgs____ =
    Object.selectionForField "(Maybe String)" "candidacy_deleteById" [ Argument.required "candidacyId" requiredArgs____.candidacyId (Admin.ScalarCodecs.codecs |> Admin.Scalar.unwrapEncoder .codecId) ] (Decode.string |> Decode.nullable)
