import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as Decoder from "io-ts/lib/Decoder";
import * as Encoder from "io-ts/lib/Encoder";
import { ValidationFailure } from "./ValidationFailure";

type StringEncoder = <T>() => Encoder.Encoder<string, T>;

export const stringEncoder: StringEncoder = <T>() => ({
  encode: String,
});

export const newTypeNumberDecoder: <T>(
  parse: (value: number) => Either.Either<ValidationFailure, T>,
) => Decoder.Decoder<unknown, T> = (parse) =>
  pipe(
    castableToNumberDecoder,
    Decoder.parse((n) =>
      pipe(
        n,
        parse,
        Either.fold(
          ({ reason }) => Decoder.failure(n, reason),
          Decoder.success,
        ),
      ),
    ),
  );

export const newTypeStringDecoder: <T>(
  parse: (value: string) => Either.Either<ValidationFailure, T>,
) => Decoder.Decoder<unknown, T> = (parse) =>
  pipe(
    Decoder.string,
    Decoder.parse((n) =>
      pipe(
        n,
        parse,
        Either.fold(
          ({ reason }) => Decoder.failure(n, reason),
          Decoder.success,
        ),
      ),
    ),
  );

const castableToNumberDecoder = {
  decode: (a) => {
    try {
      return Decoder.success(Number(a));
    } catch {
      return Decoder.failure(a, "Cannot be converted to number");
    }
  },
};
