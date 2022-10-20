import * as Either from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";
import * as D from "io-ts/lib/Decoder";
import { error, success } from "io-ts/lib/Decoder";
import { fromClassCodec } from "./io-ts/fromClassCodec";
import { ValidationFailure } from "./ValidationFailure";

export type VorRadioFrequencyProps = Codec.TypeOf<
  typeof VorRadioFrequency.propsCodec
>;

export class VorRadioFrequency {
  kHzValue;

  constructor(props: VorRadioFrequencyProps) {
    this.kHzValue = props.kHzValue;
  }

  toString() {
    return (Number(this.kHzValue) / 1000).toFixed(3);
  }

  static factory = ({
    kHzValue = 108000,
  }: Partial<VorRadioFrequencyProps> = {}) => {
    return new VorRadioFrequency({ kHzValue });
  };

  static parse: (mhzValue: number) => Either.Either<ValidationFailure, number> =
    (mhzValue) =>
      pipe(
        mhzValue,
        toKhz,
        Either.fromPredicate(
          (kHzValue) => kHzValue % 5 === 0,
          (kHzValue) =>
            ValidationFailure.create(kHzValue, `a multiple of 5 kHz`)
        ),
        Either.chain(
          Either.fromPredicate(
            (kHzValue) => kHzValue >= 108000 && kHzValue <= 117950,
            (kHzValue) =>
              ValidationFailure.create(
                kHzValue,
                `in range [108.000, 117.950] Mhz`
              )
          )
        )
      );

  static propsCodec = Codec.struct({
    kHzValue: Codec.number,
  });

  static xmlCodec = pipe(
    Codec.make(
      pipe(
        {
          decode: (v) =>
            pipe(
              VorRadioFrequency.parse(v),
              Either.foldW(
                (e) => error(e.value, e.reason),
                (v) => success(v)
              )
            ),
        },
        D.compose({ decode: (v) => success({ kHzValue: v }) })
      ),
      { encode: (v) => v.kHzValue }
    ),
    (x) => x,
    Codec.compose(VorRadioFrequency.propsCodec)
  );

  static codec = pipe(
    VorRadioFrequency.propsCodec,
    Codec.compose(fromClassCodec(VorRadioFrequency))
  );
}

const toKhz = flow((n: number) => 1000 * n, Math.round);
