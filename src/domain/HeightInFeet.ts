import * as Either from "fp-ts/lib/Either";
import { right } from "fp-ts/lib/Either";
import { flow, identity, pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/Codec";
import * as Decoder from "io-ts/lib/Decoder";
import { iso, Newtype } from "newtype-ts";

export interface HeightInFeet
  extends Newtype<{ readonly HeightInFeet: unique symbol }, number> {}

export namespace HeightInFeet {
  export const getValue = iso<HeightInFeet>().unwrap;
}

export const toHeightInFeet = iso<HeightInFeet>().wrap;

export const heightInFeetCodec = Codec.make(
  pipe(
    Decoder.number,
    Decoder.parse((height) =>
      pipe(
        height,
        flow(iso<HeightInFeet>().wrap, right),
        Either.fold(
          ({ reason }) => Decoder.failure(height, reason),
          Decoder.success,
        ),
      ),
    ),
  ),
  { encode: identity },
);
