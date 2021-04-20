import * as Either from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";
import { iso, Newtype } from "newtype-ts";
import { newTypeNumberDecoder, stringEncoder } from "./iotsUtils";
import { ValidationFailure } from "./ValidationFailure";
export enum VhfRadioFrequencySpacing {
  _8 = "8.33kHz",
  _25 = "25kHz",
}

export type VhfRadioFrequency = Newtype<
  { readonly VhfRadioFrequency: unique symbol },
  string
>;

export namespace VhfRadioFrequency {
  const toKhz = flow((n: number) => 1000 * n, Math.round);
  export const parse: (
    mhzValue: number,
  ) => Either.Either<ValidationFailure, VhfRadioFrequency> = (mhzValue) =>
    pipe(
      mhzValue,
      toKhz,
      Either.fromPredicate(
        (kHzValue) => kHzValue % 5 === 0,
        (_) => ValidationFailure.create(`a multiple of 5 kHz`),
      ),
      Either.chain(
        Either.fromPredicate(
          (kHzValue) => kHzValue >= 117975 && kHzValue <= 137000,
          (_) => ValidationFailure.create(`in range [117.975, 137.000] Mhz`),
        ),
      ),
      Either.map((kHzValue) => {
        const freq = (Number(kHzValue) / 1000).toFixed(3);
        // console.log(freq)
        return freq;
      }),
      Either.map(iso<VhfRadioFrequency>().wrap),
    );
  export const getValue = iso<VhfRadioFrequency>().unwrap;
}

export const EMERGENCY = iso<VhfRadioFrequency>().wrap("121.500");
export const AUTOINFO = iso<VhfRadioFrequency>().wrap("123.500");

export const vhfRadioFrequencyCodec = Codec.make(
  newTypeNumberDecoder(VhfRadioFrequency.parse),
  stringEncoder(),
);
