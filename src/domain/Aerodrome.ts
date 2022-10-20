import * as Codec from "io-ts/Codec";
import { AltitudeInFeet, altitudeInFeetCodec } from "./AltitudeInFeet";
import { Frequencies } from "./Frequencies";
import { IcaoCode, icaoCodeCodec } from "./IcaoCode";
import { LatLng, latLngCodec } from "./LatLng";
import { Runways, runwaysCodec } from "./Runways";
import { VfrPoint } from "./VfrPoint";

const statusCodec = Codec.literal("MIL", "CAP", "RST", "OFF", "PRV");
export interface Aerodrome {
  icaoCode: IcaoCode;
  aerodromeAltitude: AltitudeInFeet;
  latLng: LatLng;
  frequencies: Frequencies;
  name: string;
  mapShortName: string;
  magneticVariation: number;
  runways: Runways;
  vfrPoints: VfrPoint[];
  status: Codec.OutputOf<typeof statusCodec>;
}

export const aerodromeCodec: Codec.Codec<unknown, any, Aerodrome> =
  Codec.struct({
    latLng: latLngCodec,
    aerodromeAltitude: altitudeInFeetCodec,
    icaoCode: icaoCodeCodec,
    frequencies: Frequencies.codec,
    name: Codec.string,
    mapShortName: Codec.string,
    magneticVariation: Codec.number,
    runways: runwaysCodec,
    vfrPoints: Codec.array(VfrPoint.codec),
    status: statusCodec,
  });
