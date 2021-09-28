import { Option } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types";
import * as Codec from "io-ts/lib/Codec";
import { VhfRadioFrequency } from ".";
import { vhfRadioFrequencyCodec } from "./VhfRadioFrequency";
export type VhfFrequencyWithRemarks = {
  frequency: VhfRadioFrequency;
  remarks: Option<string>;
};

export const vhfFrequencyWithRemarksCodec = Codec.struct({
  frequency: vhfRadioFrequencyCodec,
  remarks: optionFromNullable(t.string) as Codec.Codec<
    any,
    unknown,
    Option<string>
  >,
});
