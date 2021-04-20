import * as Codec from "io-ts/lib/Codec";
import { Runway, runwayCodec } from "./Runway";

export interface Runways {
  mainRunway: Runway;
  runways: Runway[];
}

export const runwaysCodec = Codec.struct({
  mainRunway: runwayCodec,
  runways: Codec.array(runwayCodec)
});
