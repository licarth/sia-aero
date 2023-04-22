import * as Either from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import { unknown } from "io-ts";
import { number } from "io-ts/lib/Codec";
import * as Decoder from "io-ts/lib/Decoder";
import * as Encoder from "io-ts/lib/Encoder";
import { ValidationFailure } from "./ValidationFailure";

type StringEncoder = <T>() => Encoder.Encoder<string, T>;
type NumberEncoder = <T>() => Encoder.Encoder<number, T>;

export const stringEncoder: StringEncoder = <T>() => ({
  encode: String,
});

export const numberEncoder: NumberEncoder = <T>() => ({
  encode: flow((x) => x as unknown as number, number.encode),
});

export const parseNumberToDecoder: <T>(
  parse: (value: number) => Either.Either<ValidationFailure, T>
) => Decoder.Decoder<unknown, T> = (parse) =>
  pipe(
    castableToNumberDecoder,
    Decoder.parse((n) =>
      pipe(
        n,
        parse,
        Either.fold(({ reason }) => Decoder.failure(n, reason), Decoder.success)
      )
    )
  );

export const parseStringToDecoder: <T>(
  parse: (value: string) => Either.Either<ValidationFailure, T>
) => Decoder.Decoder<unknown, T> = (parse) =>
  pipe(
    Decoder.string,
    Decoder.parse((n) =>
      pipe(
        n,
        parse,
        Either.fold(({ reason }) => Decoder.failure(n, reason), Decoder.success)
      )
    )
  );

const castableToNumberDecoder = {
  decode: (a: any) => {
    try {
      return Decoder.success(Number(a));
    } catch {
      return Decoder.failure(a, "Cannot be converted to number");
    }
  },
};
