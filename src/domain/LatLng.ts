import { flow, pipe } from "fp-ts/function";
import * as Either from "fp-ts/lib/Either";
import * as Codec from "io-ts/Codec";
import * as Decoder from "io-ts/Decoder";
import { iso, Newtype } from "newtype-ts";
import { numberEncoder } from "./iotsUtils";
import { ValidationFailure } from "./ValidationFailure";

export interface Latitude
  extends Newtype<{ readonly Latitude: unique symbol }, number> {}

export namespace Latitude {
  export const parse: (
    value: number,
  ) => Either.Either<ValidationFailure, Latitude> = flow(
    Either.fromPredicate(
      (n) => n >= -90 && n <= 90,
      (value) => ValidationFailure.create(value, `in [-90,90]`),
    ),
    Either.map(iso<Latitude>().wrap),
  );
  export const getValue = iso<Latitude>().unwrap;
}

export interface Longitude
  extends Newtype<{ readonly Longitude: unique symbol }, number> {}
export namespace Longitude {
  export const parse: (
    value: number,
  ) => Either.Either<ValidationFailure, Longitude> = flow(
    Either.fromPredicate(
      (n) => !(n < -180 || n > 180),
      (value) => ValidationFailure.create(value, `in [-180,180]`),
    ),
    Either.map(iso<Longitude>().wrap),
  );
  export const getValue = iso<Longitude>().unwrap;
}

export interface LatLng {
  lat: Latitude;
  lng: Longitude;
}

export namespace LatLng {
  export const parse: (value: any) => Either.Either<ValidationFailure, LatLng> =
    ({ lat, lng }) =>
      pipe(
        Either.Do,
        Either.bind("lat", () => Latitude.parse(lat)),
        Either.bind("lng", () => Longitude.parse(lng)),
      );
}

const latDecoder = pipe(
  Decoder.number,
  Decoder.parse((n) =>
    pipe(
      n,
      Latitude.parse,
      Either.fold(({ reason }) => Decoder.failure(n, reason), Decoder.success),
    ),
  ),
);

const lonDecoder = pipe(
  Decoder.number,
  Decoder.parse((n) =>
    pipe(
      n,
      Longitude.parse,
      Either.fold(({ reason }) => Decoder.failure(n, reason), Decoder.success),
    ),
  ),
);

const latCodec = Codec.make(latDecoder, numberEncoder<Latitude>());
const lonCodec = Codec.make(lonDecoder, numberEncoder<Longitude>());

export const latLngCodec = Codec.struct({
  lat: latCodec,
  lng: lonCodec,
});
