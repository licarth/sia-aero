import * as Codec from "io-ts/lib/Codec";
import { aerodromeCodec } from "./Aerodrome";
import { airspaceCodec } from "./Airspace";
import { DangerZone } from "./DangerZone";
import { obstacleCodec } from "./Obstacle";
import { VfrPoint } from "./VfrPoint";
import { Vor } from "./Vor";

export const airacCycleCodec = Codec.struct({
  aerodromes: Codec.array(aerodromeCodec),
  obstacles: Codec.array(obstacleCodec),
  vfrPoints: Codec.array(VfrPoint.codec),
  airspaces: Codec.array(airspaceCodec),
  dangerZones: Codec.array(DangerZone.codec),
  vors: Codec.array(Vor.codec),
});

export type AiracCycleData = Codec.TypeOf<typeof airacCycleCodec>;
