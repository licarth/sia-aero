import * as Codec from "io-ts/Codec";
import { VhfFrequencyWithRemarks } from "./FrequencyWithRemarks";

export namespace Frequencies {
  export const codec = Codec.struct({
    afis: Codec.array(VhfFrequencyWithRemarks.codec),
    atis: Codec.array(VhfFrequencyWithRemarks.codec),
    autoinfo: Codec.array(VhfFrequencyWithRemarks.codec),
    tower: Codec.array(VhfFrequencyWithRemarks.codec),
    ground: Codec.array(VhfFrequencyWithRemarks.codec),
  });
}

export type Frequencies = Codec.TypeOf<typeof Frequencies.codec>;
