import * as Codec from "io-ts/lib/Codec";
import { aerodromeCodec } from "./Aerodrome";
import { airspaceCodec } from "./Airspace";
import { dangerZoneCodec } from "./DangerZone";
import { obstacleCodec } from "./Obstacle";
import { vfrPointCodec } from "./VfrPoint";

export const airacCycleCodec = Codec.struct({
  aerodromes: Codec.array(aerodromeCodec),
  obstacles: Codec.array(obstacleCodec),
  vfrPoints: Codec.array(vfrPointCodec),
  airspaces: Codec.array(airspaceCodec),
  dangerZones: Codec.array(dangerZoneCodec),
});

export type AiracCycleData = Codec.TypeOf<typeof airacCycleCodec>;
