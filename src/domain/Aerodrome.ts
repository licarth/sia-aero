import * as Codec from "io-ts/Codec";
import { AltitudeInFeet, altitudeInFeetCodec } from "./AltitudeInFeet";
import { Frequencies, frequenciesCodec } from "./Frequencies";
import { IcaoCode, icaoCodeCodec } from "./IcaoCode";
import { LatLng, latLngCodec } from "./LatLng";

export interface Aerodrome {
  icaoCode: IcaoCode;
  aerodromeAltitude: AltitudeInFeet;
  latLng: LatLng;
  frequencies: Frequencies;
  name: string;
  mapShortName: string;
  magneticVariation: number;
}

export const aerodromeCodec: Codec.Codec<unknown, any, Aerodrome> = Codec.struct({
  latLng: latLngCodec,
  aerodromeAltitude: altitudeInFeetCodec,
  icaoCode: icaoCodeCodec,
  frequencies: frequenciesCodec,
  name: Codec.string,
  mapShortName: Codec.string,
  magneticVariation: Codec.number,
});
