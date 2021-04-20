import * as Codec from "io-ts/lib/Codec";
import { Aerodrome, aerodromeCodec } from "./Aerodrome";
import { Obstacle, obstacleCodec } from "./Obstacle";

export type AiracCycleData = {
  aerodromes: Aerodrome[];
  obstacles: Obstacle[];
};

export const airacCycleCodec = Codec.struct({
  aerodromes: Codec.array(aerodromeCodec),
  obstacles: Codec.array(obstacleCodec),
});
