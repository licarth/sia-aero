import * as Eq from "fp-ts/lib/Eq";
import { unsafeCoerce } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";

export type Opaque<K extends string, T> = T & { __TYPE__: K };

const opaqueCodec =
  <I, O, A>(codec: Codec.Codec<I, O, A>) =>
  <T extends Opaque<any, A>>(_opaqueName: string): Codec.Codec<I, O, T> =>
    unsafeCoerce(codec);

export const stringOpaqueCodec = opaqueCodec(Codec.string);

export const opaqueEq: <A, T extends Opaque<any, A>>(
  eq: Eq.Eq<A>
) => Eq.Eq<T> = (eq) => Eq.fromEquals(eq.equals);
