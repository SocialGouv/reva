-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Scalar exposing (Codecs, Date(..), Id(..), Void(..), defaultCodecs, defineCodecs, unwrapCodecs, unwrapEncoder)

import Graphql.Codec exposing (Codec)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode


type Date
    = Date String


type Id
    = Id String


type Void
    = Void String


defineCodecs :
    { codecDate : Codec valueDate
    , codecId : Codec valueId
    , codecVoid : Codec valueVoid
    }
    -> Codecs valueDate valueId valueVoid
defineCodecs definitions =
    Codecs definitions


unwrapCodecs :
    Codecs valueDate valueId valueVoid
    ->
        { codecDate : Codec valueDate
        , codecId : Codec valueId
        , codecVoid : Codec valueVoid
        }
unwrapCodecs (Codecs unwrappedCodecs) =
    unwrappedCodecs


unwrapEncoder :
    (RawCodecs valueDate valueId valueVoid -> Codec getterValue)
    -> Codecs valueDate valueId valueVoid
    -> getterValue
    -> Graphql.Internal.Encode.Value
unwrapEncoder getter (Codecs unwrappedCodecs) =
    (unwrappedCodecs |> getter |> .encoder) >> Graphql.Internal.Encode.fromJson


type Codecs valueDate valueId valueVoid
    = Codecs (RawCodecs valueDate valueId valueVoid)


type alias RawCodecs valueDate valueId valueVoid =
    { codecDate : Codec valueDate
    , codecId : Codec valueId
    , codecVoid : Codec valueVoid
    }


defaultCodecs : RawCodecs Date Id Void
defaultCodecs =
    { codecDate =
        { encoder = \(Date raw) -> Encode.string raw
        , decoder = Object.scalarDecoder |> Decode.map Date
        }
    , codecId =
        { encoder = \(Id raw) -> Encode.string raw
        , decoder = Object.scalarDecoder |> Decode.map Id
        }
    , codecVoid =
        { encoder = \(Void raw) -> Encode.string raw
        , decoder = Object.scalarDecoder |> Decode.map Void
        }
    }
