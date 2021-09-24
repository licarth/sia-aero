import * as Codec from "io-ts/lib/Codec";
import { Aerodrome, aerodromeCodec } from "./Aerodrome";
import { Obstacle, obstacleCodec } from "./Obstacle";
import { VfrPoint, vfrPointCodec } from "./VfrPoint";

export type AiracCycleData = {
  aerodromes: Aerodrome[];
  obstacles: Obstacle[];
  vfrPoints: VfrPoint[];
};

export const airacCycleCodec = Codec.struct({
  aerodromes: Codec.array(aerodromeCodec),
  obstacles: Codec.array(obstacleCodec),
  vfrPoints: Codec.array(vfrPointCodec),
});
