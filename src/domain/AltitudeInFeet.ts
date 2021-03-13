import * as Either from "fp-ts/lib/Either";
import { right } from "fp-ts/lib/Either";
import { flow, identity, pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/Codec";
import * as Decoder from "io-ts/lib/Decoder";
import { iso, Newtype } from "newtype-ts";

export interface AltitudeInFeet
  extends Newtype<{ readonly AerodromeAltitude: unique symbol }, number> {}

export const toAltitudeInFeet = iso<AltitudeInFeet>().wrap;

export const altitudeInFeetCodec = Codec.make(
  pipe(
    Decoder.number,
    Decoder.parse((altitude) =>
      pipe(
        altitude,
        flow(iso<AltitudeInFeet>().wrap, right),
        Either.fold(
          ({ reason }) => Decoder.failure(altitude, reason),
          Decoder.success,
        ),
      ),
    ),
  ),
  { encode: identity },
);
