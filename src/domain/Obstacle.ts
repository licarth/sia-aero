import * as Codec from "io-ts/lib/Codec";
import { AltitudeInFeet, altitudeInFeetCodec } from "./AltitudeInFeet";
import { HeightInFeet, heightInFeetCodec } from "./HeightInFeet";
import { LatLng, latLngCodec } from "./LatLng";

export interface Obstacle {
  latLng: LatLng;
  amslAltitude: AltitudeInFeet;
  aglHeight: HeightInFeet;
}

export const obstacleCodec = Codec.struct({
  latLng: latLngCodec,
  amslAltitude: altitudeInFeetCodec,
  aglHeight: heightInFeetCodec,
});
