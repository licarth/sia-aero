import * as Either from "fp-ts/Either";
import { flow, identity, pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";
import * as Decoder from "io-ts/lib/Decoder";
import { iso, Newtype } from "newtype-ts";
import { ValidationFailure } from "./ValidationFailure";

export interface IcaoCode
  extends Newtype<{ readonly IcaoCode: unique symbol }, string> {}

export namespace IcaoCode {
  export const parse: (
    value: string,
  ) => Either.Either<ValidationFailure, IcaoCode> = flow(
    Either.fromPredicate(
      (value) => value.length === 4,
      (value) => ValidationFailure.create(value, `a valid 4-letter code`),
    ),
    Either.map(iso<IcaoCode>().wrap),
  );
  export const getValue = iso<IcaoCode>().unwrap;
}

export const icaoCodeCodec: Codec.Codec<unknown, any, IcaoCode> = Codec.make(
  pipe(
    Decoder.string,
    Decoder.parse((icaoCode) =>
      pipe(
        icaoCode,
        IcaoCode.parse,
        Either.fold(
          ({ reason }) => Decoder.failure(icaoCode, reason),
          Decoder.success,
        ),
      ),
    ),
  ),
  { encode: identity },
);
