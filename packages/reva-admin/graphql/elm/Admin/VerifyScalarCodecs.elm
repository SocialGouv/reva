-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.VerifyScalarCodecs exposing (..)

{-
   This file is intended to be used to ensure that custom scalar decoder
   files are valid. It is compiled using `elm make` by the CLI.
-}

import Admin.Scalar
import Data.Scalar


verify : Admin.Scalar.Codecs Data.Scalar.Id Data.Scalar.Timestamp Data.Scalar.Uuid Data.Scalar.Void
verify =
    Data.Scalar.codecs
