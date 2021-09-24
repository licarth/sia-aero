import * as Codec from "io-ts/lib/Codec";
import { IcaoCode, icaoCodeCodec } from "./IcaoCode";
import { LatLng, latLngCodec } from "./LatLng";

export interface VfrPoint {
  icaoCode: IcaoCode;
  name: string;
  description: string;
  latLng: LatLng;
}

export const vfrPointCodec: Codec.Codec<unknown, any, VfrPoint> = Codec.struct({
  icaoCode: icaoCodeCodec,
  name: Codec.string,
  description: Codec.string,
  latLng: latLngCodec,
});
