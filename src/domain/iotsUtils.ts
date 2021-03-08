import * as Encoder from "io-ts/lib/Encoder";

type StringEncoder = <T>() => Encoder.Encoder<string, T>;

export const stringEncoder: StringEncoder = <T>() => ({
  encode: String,
});
