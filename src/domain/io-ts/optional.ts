import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Codec, make } from "io-ts/lib/Codec";
import { Decoder } from "io-ts/lib/Decoder";
import { Encoder } from "io-ts/lib/Encoder";

export const optionalE: <O, A>(
  or: Encoder<O, A>
) => Encoder<O | undefined, O.Option<A>> = (or) => ({
  encode: flow(O.map(or.encode), O.toUndefined),
});

export const optionalD: <I, A>(
  or: Decoder<I, A>
) => Decoder<I | undefined, O.Option<A>> = (or) => ({
  decode: (i) =>
    i === undefined ? E.right(O.none) : pipe(i, or.decode, E.map(O.some)),
});

export const optional: <I, O, A>(
  codec: Codec<I, O, A>
) => Codec<I | undefined, O | undefined, O.Option<A>> = (codec) =>
  make(optionalD(codec), optionalE(codec));
