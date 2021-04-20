import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";
import * as Decoder from "io-ts/lib/Decoder";
import { iso, Newtype } from "newtype-ts";
import {
  newTypeNumberDecoder,
  numberEncoder,
  stringEncoder,
} from "./iotsUtils";
import { ValidationFailure } from "./ValidationFailure";

export type MagneticRunwayOrientation = Newtype<
  { readonly VhfRadioFrequency: unique symbol },
  number
>;

export type RunwaySurface = "asphalt" | "grass";

export interface Runway {
  magneticOrientation: MagneticRunwayOrientation;
  lengthInMeters: number;
  name: string;
  surface: RunwaySurface;
}

export namespace MagneticRunwayOrientation {
  export const parse: (
    orientationInDegrees: number,
  ) => Either.Either<ValidationFailure, MagneticRunwayOrientation> = (value) =>
    pipe(
      value,
      Either.fromPredicate(
        (orientationInDegrees) =>
          orientationInDegrees >= 0 && orientationInDegrees <= 180,
        (_) => ValidationFailure.create(`in range [0, 180] °`),
      ),
      Either.map(iso<MagneticRunwayOrientation>().wrap),
    );
  export const getValue = iso<MagneticRunwayOrientation>().unwrap;
}

const surfaceDecoder: Decoder.Decoder<unknown, RunwaySurface> = pipe(
  Decoder.string,
  Decoder.compose({
    decode: (surface) => {
      switch (surface) {
        case "non revo?=tue":
        case "gazon":
        case "grass":
          return Decoder.success("grass");
        case "bo?=ton bitumineux":
        case "asphalt":
        case "asphalte":
        case "macadam":
        case "bo?=ton":
        case "revo?=tue":
        case "enrobo?= bitumineux":
          return Decoder.success("asphalt");
        default:
          return Decoder.failure(surface, "asphalt or grass");
      }
    },
  }),
);

export const runwayCodec = Codec.struct({
  magneticOrientation: Codec.make(
    newTypeNumberDecoder(MagneticRunwayOrientation.parse),
    numberEncoder(),
  ),
  surface: Codec.make(surfaceDecoder, stringEncoder()),
  name: Codec.string,
  lengthInMeters: Codec.number,
});
