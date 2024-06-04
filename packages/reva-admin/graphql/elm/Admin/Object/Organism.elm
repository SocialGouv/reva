-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.Organism exposing (..)

import Admin.Enum.OrganismTypology
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
import Json.Decode as Decode


id : SelectionSet Data.Scalar.Uuid Admin.Object.Organism
id =
    Object.selectionForField "Data.Scalar.Uuid" "id" [] (Data.Scalar.codecs |> Admin.Scalar.unwrapCodecs |> .codecUuid |> .decoder)


label : SelectionSet String Admin.Object.Organism
label =
    Object.selectionForField "String" "label" [] Decode.string


contactAdministrativeEmail : SelectionSet String Admin.Object.Organism
contactAdministrativeEmail =
    Object.selectionForField "String" "contactAdministrativeEmail" [] Decode.string


contactAdministrativePhone : SelectionSet (Maybe String) Admin.Object.Organism
contactAdministrativePhone =
    Object.selectionForField "(Maybe String)" "contactAdministrativePhone" [] (Decode.string |> Decode.nullable)


website : SelectionSet (Maybe String) Admin.Object.Organism
website =
    Object.selectionForField "(Maybe String)" "website" [] (Decode.string |> Decode.nullable)


typology : SelectionSet Admin.Enum.OrganismTypology.OrganismTypology Admin.Object.Organism
typology =
    Object.selectionForField "Enum.OrganismTypology.OrganismTypology" "typology" [] Admin.Enum.OrganismTypology.decoder


type alias OrganismOnDepartmentsOptionalArguments =
    { departmentId : OptionalArgument Data.Scalar.Uuid }


organismOnDepartments :
    (OrganismOnDepartmentsOptionalArguments -> OrganismOnDepartmentsOptionalArguments)
    -> SelectionSet decodesTo Admin.Object.OrganismOnDepartment
    -> SelectionSet (List decodesTo) Admin.Object.Organism
organismOnDepartments fillInOptionals____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { departmentId = Absent }

        optionalArgs____ =
            [ Argument.optional "departmentId" filledInOptionals____.departmentId (Data.Scalar.codecs |> Admin.Scalar.unwrapEncoder .codecUuid) ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "organismOnDepartments" optionalArgs____ object____ (Basics.identity >> Decode.list)


isActive : SelectionSet Bool Admin.Object.Organism
isActive =
    Object.selectionForField "Bool" "isActive" [] Decode.bool


fermePourAbsenceOuConges : SelectionSet Bool Admin.Object.Organism
fermePourAbsenceOuConges =
    Object.selectionForField "Bool" "fermePourAbsenceOuConges" [] Decode.bool


informationsCommerciales :
    SelectionSet decodesTo Admin.Object.OrganismInformationsCommerciales
    -> SelectionSet (Maybe decodesTo) Admin.Object.Organism
informationsCommerciales object____ =
    Object.selectionForCompositeField "informationsCommerciales" [] object____ (Basics.identity >> Decode.nullable)


maisonMereAAP :
    SelectionSet decodesTo Admin.Object.MaisonMereAAP
    -> SelectionSet (Maybe decodesTo) Admin.Object.Organism
maisonMereAAP object____ =
    Object.selectionForCompositeField "maisonMereAAP" [] object____ (Basics.identity >> Decode.nullable)


managedDegrees :
    SelectionSet decodesTo Admin.Object.OrganismOnDegree
    -> SelectionSet (List decodesTo) Admin.Object.Organism
managedDegrees object____ =
    Object.selectionForCompositeField "managedDegrees" [] object____ (Basics.identity >> Decode.list)


organismOnAccount :
    SelectionSet decodesTo Admin.Object.Account
    -> SelectionSet (Maybe decodesTo) Admin.Object.Organism
organismOnAccount object____ =
    Object.selectionForCompositeField "organismOnAccount" [] object____ (Basics.identity >> Decode.nullable)


domaines :
    SelectionSet decodesTo Admin.Object.Domaine
    -> SelectionSet (List decodesTo) Admin.Object.Organism
domaines object____ =
    Object.selectionForCompositeField "domaines" [] object____ (Basics.identity >> Decode.list)


conventionCollectives :
    SelectionSet decodesTo Admin.Object.ConventionCollective
    -> SelectionSet (List decodesTo) Admin.Object.Organism
conventionCollectives object____ =
    Object.selectionForCompositeField "conventionCollectives" [] object____ (Basics.identity >> Decode.list)


llToEarth : SelectionSet (Maybe String) Admin.Object.Organism
llToEarth =
    Object.selectionForField "(Maybe String)" "llToEarth" [] (Decode.string |> Decode.nullable)


distanceKm : SelectionSet (Maybe Float) Admin.Object.Organism
distanceKm =
    Object.selectionForField "(Maybe Float)" "distanceKm" [] (Decode.float |> Decode.nullable)
