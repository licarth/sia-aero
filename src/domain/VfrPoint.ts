import * as Codec from "io-ts/lib/Codec";
import { icaoCodeCodec } from "./IcaoCode";
import { latLngCodec } from "./LatLng";

export type VfrPoint = Codec.TypeOf<typeof vfrPointCodec>;

export const vfrPointCodec = Codec.struct({
  icaoCode: icaoCodeCodec,
  name: Codec.string,
  description: Codec.nullable(Codec.string),
  latLng: latLngCodec,
});
