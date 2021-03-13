import * as Codec from "io-ts/Codec";
import { VhfRadioFrequency, vhfRadioFrequencyCodec } from "./VhfRadioFrequency";

export interface Frequencies {
  autoinfo: ReadonlyArray<VhfRadioFrequency>;
  atis: ReadonlyArray<VhfRadioFrequency>;
  tower: ReadonlyArray<VhfRadioFrequency>;
  ground: ReadonlyArray<VhfRadioFrequency>;
}

export const frequenciesCodec = Codec.struct({
  atis: Codec.array(vhfRadioFrequencyCodec),
  autoinfo: Codec.array(vhfRadioFrequencyCodec),
  tower: Codec.array(vhfRadioFrequencyCodec),
  ground: Codec.array(vhfRadioFrequencyCodec),
});
