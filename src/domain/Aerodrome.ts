import * as Codec from "io-ts/Codec";
import { AltitudeInFeet, altitudeInFeetCodec } from "./AltitudeInFeet";
import { IcaoCode, icaoCodeCodec } from "./IcaoCode";
import { LatLng, latLngCodec } from "./LatLng";

export interface Aerodrome {
  icaoCode: IcaoCode;
  aerodromeAltitude: AltitudeInFeet;
  latLng: LatLng;
}

export const aerodromeCodec: Codec.Codec<unknown, any, Aerodrome> = Codec.type({
  latLng: latLngCodec,
  aerodromeAltitude: altitudeInFeetCodec,
  icaoCode: icaoCodeCodec,
});
