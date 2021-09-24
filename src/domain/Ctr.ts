import * as Codec from "io-ts/Codec";
import { LatLng, latLngCodec } from "./LatLng";

export interface Ctr {
  name: string;
  geometry: LatLng[];
}

export const ctrCodec: Codec.Codec<unknown, any, Ctr> = Codec.struct({
  name: Codec.string,
  geometry: Codec.array(latLngCodec),
});
