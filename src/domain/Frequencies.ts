import * as Codec from "io-ts/Codec";
import {
  VhfFrequencyWithRemarks,
  vhfFrequencyWithRemarksCodec
} from "./FrequencyWithRemarks";

export interface Frequencies {
  afis: ReadonlyArray<VhfFrequencyWithRemarks>;
  atis: ReadonlyArray<VhfFrequencyWithRemarks>;
  autoinfo: ReadonlyArray<VhfFrequencyWithRemarks>;
  ground: ReadonlyArray<VhfFrequencyWithRemarks>;
  tower: ReadonlyArray<VhfFrequencyWithRemarks>;
}

export const frequenciesCodec = Codec.struct({
  afis: Codec.array(vhfFrequencyWithRemarksCodec),
  atis: Codec.array(vhfFrequencyWithRemarksCodec),
  autoinfo: Codec.array(vhfFrequencyWithRemarksCodec),
  tower: Codec.array(vhfFrequencyWithRemarksCodec),
  ground: Codec.array(vhfFrequencyWithRemarksCodec),
});
