import * as Either from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";
import * as Decoder from "io-ts/lib/Decoder";
import { iso, Newtype } from "newtype-ts";
import { newTypeNumberDecoder, stringEncoder } from "./iotsUtils";
import { ValidationFailure } from "./ValidationFailure";
export enum VhfRadioFrequencySpacing {
  _8 = "8.33kHz",
  _25 = "25kHz",
}
export type CivilVhfRadioFrequency = Newtype<
  { readonly CivilVhfRadioFrequency: unique symbol },
  string
>;

export namespace CivilVhfRadioFrequency {
  const toKhz = flow((n: number) => 1000 * n, Math.round);
  export const parse: (
    mhzValue: number,
  ) => Either.Either<ValidationFailure, CivilVhfRadioFrequency> = (mhzValue) =>
    pipe(
      mhzValue,
      toKhz,
      Either.fromPredicate(
        (kHzValue) => kHzValue % 5 === 0,
        (kHzValue) => ValidationFailure.create(kHzValue, `a multiple of 5 kHz`),
      ),
      Either.chain(
        Either.fromPredicate(
          (kHzValue) => kHzValue >= 117975 && kHzValue <= 137000,
          (kHzValue) =>
            ValidationFailure.create(
              kHzValue,
              `in range [117.975, 137.000] Mhz`,
            ),
        ),
      ),
      Either.map((kHzValue) => {
        const freq = (Number(kHzValue) / 1000).toFixed(3);
        return freq;
      }),
      Either.map(iso<CivilVhfRadioFrequency>().wrap),
    );
  export const getValue = iso<CivilVhfRadioFrequency>().unwrap;
}

export const EMERGENCY = iso<CivilVhfRadioFrequency>().wrap("121.500");
export const AUTOINFO = iso<CivilVhfRadioFrequency>().wrap("123.500");

export type VhfRadioFrequency = Codec.TypeOf<typeof vhfRadioFrequencyCodec>;

export type MilitaryVhfRadioFrequency = Newtype<
  { readonly MilitaryVhfRadioFrequency: unique symbol },
  string
>;

export namespace MilitaryVhfRadioFrequency {
  const toKhz = flow((n: number) => 1000 * n, Math.round);
  export const parse: (
    mhzValue: number,
  ) => Either.Either<ValidationFailure, MilitaryVhfRadioFrequency> = (
    mhzValue,
  ) =>
    pipe(
      mhzValue,
      toKhz,
      Either.fromPredicate(
        (kHzValue) => kHzValue % 5 === 0,
        (kHzValue) => ValidationFailure.create(kHzValue, `a multiple of 5 kHz`),
      ),
      Either.chain(
        Either.fromPredicate(
          (kHzValue) => kHzValue > 137000,
          (kHzValue) =>
            ValidationFailure.create(kHzValue, `in range ]137.000, +[ Mhz`),
        ),
      ),
      Either.map((kHzValue) => {
        const freq = (Number(kHzValue) / 1000).toFixed(3);
        return freq;
      }),
      Either.map(iso<MilitaryVhfRadioFrequency>().wrap),
    );
  export const getValue = iso<MilitaryVhfRadioFrequency>().unwrap;
}

export const civilVhfRadioFrequencyCodec = Codec.make(
  newTypeNumberDecoder(CivilVhfRadioFrequency.parse),
  stringEncoder(),
);
export const militaryVhfRadioFrequencyCodec = Codec.make(
  newTypeNumberDecoder(MilitaryVhfRadioFrequency.parse),
  stringEncoder(),
);
export const vhfRadioFrequencyCodec = Codec.make(
  Decoder.union(civilVhfRadioFrequencyCodec, militaryVhfRadioFrequencyCodec),
  stringEncoder(),
);
