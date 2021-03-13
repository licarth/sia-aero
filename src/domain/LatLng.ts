import { flow, pipe } from "fp-ts/function";
import * as Either from "fp-ts/lib/Either";
import * as Codec from "io-ts/Codec";
import * as Decoder from "io-ts/Decoder";
import { iso, Newtype } from "newtype-ts";
import { stringEncoder } from "./iotsUtils";
import { ValidationFailure } from "./ValidationFailure";

export interface Latitude
  extends Newtype<{ readonly Latitude: unique symbol }, number> {}

export namespace Latitude {
  export const parse: (
    value: number,
  ) => Either.Either<ValidationFailure, Latitude> = flow(
    Either.fromPredicate(
      (n) => n >= -90 && n <= 90,
      (n) => ValidationFailure.create(`Provided value ${n} is not in [-90,90]`),
    ),
    Either.map(iso<Latitude>().wrap),
  );
}

export interface Longitude
  extends Newtype<{ readonly Longitude: unique symbol }, number> {}
export namespace Longitude {
  export const parse: (
    value: number,
  ) => Either.Either<ValidationFailure, Longitude> = flow(
    Either.fromPredicate(
      (n) => !(n < -180 || n > 180),
      (n) =>
        ValidationFailure.create(`Provided value ${n} is not in [-180,180]`),
    ),
    Either.map(iso<Longitude>().wrap),
  );
}

export interface LatLng {
  lat: Latitude;
  lng: Longitude;
}

const latDecoder = pipe(
  Decoder.number,
  Decoder.parse((n) =>
    pipe(
      n,
      Latitude.parse,
      Either.fold(
        ({ reason }) => Decoder.failure(n, reason),
        Decoder.success,
      ),
    ),
  ),
);

const lonDecoder = pipe(
  Decoder.number,
  Decoder.parse((n) =>
    pipe(
      n,
      Longitude.parse,
      Either.fold(
        ({ reason }) => Decoder.failure(n, reason),
        Decoder.success,
      ),
    ),
  ),
);

const latCodec = Codec.make(latDecoder, stringEncoder<Latitude>());
const lonCodec = Codec.make(lonDecoder, stringEncoder<Longitude>());

export const latLngCodec = Codec.struct({
  lat: latCodec,
  lng: lonCodec,
});
