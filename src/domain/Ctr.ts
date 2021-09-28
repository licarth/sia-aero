import * as Codec from "io-ts/Codec";
import { airspaceClassCodec } from "./AirspaceClass";
import { altitudeHeightFlightLevelSum } from "./AltitudeHeightFlightLevel";
import { latLngCodec } from "./LatLng";

export const ctrCodec = Codec.struct({
  name: Codec.string,
  geometry: Codec.array(latLngCodec),
  lowerLimit: altitudeHeightFlightLevelSum,
  higherLimit: altitudeHeightFlightLevelSum,
  airspaceClass: airspaceClassCodec,
});

export type Ctr = Codec.TypeOf<typeof ctrCodec>;
