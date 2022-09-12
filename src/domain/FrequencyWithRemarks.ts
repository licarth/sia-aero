import * as Codec from "io-ts/lib/Codec";
import { optional } from "./io-ts/optional";
import { VhfRadioFrequency } from "./VhfRadioFrequency";

export const remarksCodec = optional(Codec.string);

export namespace VhfFrequencyWithRemarks {
  export const codec = Codec.struct({
    frequency: VhfRadioFrequency.codec,
    remarks: remarksCodec,
  });
  const b = Codec.fromStruct({});
}

export type VhfFrequencyWithRemarks = Codec.TypeOf<
  typeof VhfFrequencyWithRemarks.codec
>;
